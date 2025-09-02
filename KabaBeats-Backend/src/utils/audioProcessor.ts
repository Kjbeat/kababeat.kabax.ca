import { spawn } from 'child_process';
import { logger } from '@/config/logger';
import path from 'path';
import fs from 'fs/promises';
import { generateHLSPlaylists, HLSPlaylist, AudioProcessingOptions } from './hlsStreaming';

export interface AudioMetadata {
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  format: string;
  codec: string;
  size: number;
}

export interface AudioProcessingResult {
  originalFile: string;
  processedFiles: {
    preview?: string;
    full?: string;
    hls?: HLSPlaylist;
  };
  metadata: AudioMetadata;
  processingTime: number;
}

export interface ProcessingOptions {
  generatePreview: boolean;
  previewDuration: number;
  generateHLS: boolean;
  hlsOptions?: Partial<AudioProcessingOptions>;
  outputFormats: string[];
  quality: 'low' | 'medium' | 'high';
}

/**
 * Process audio file with FFmpeg
 */
export const processAudioFile = async (
  inputFile: string,
  outputDir: string,
  options: ProcessingOptions
): Promise<AudioProcessingResult> => {
  const startTime = Date.now();
  
  try {
    logger.info(`Starting audio processing for: ${inputFile}`);
    
    // Extract metadata first
    const metadata = await extractAudioMetadata(inputFile);
    
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    
    const processedFiles: AudioProcessingResult['processedFiles'] = {};
    
    // Generate preview if requested
    if (options.generatePreview) {
      const previewFile = await generateAudioPreview(
        inputFile,
        outputDir,
        options.previewDuration,
        options.quality
      );
      processedFiles.preview = previewFile;
    }
    
    // Generate full quality version
    const fullFile = await generateFullAudio(
      inputFile,
      outputDir,
      options.quality
    );
    processedFiles.full = fullFile;
    
    // Generate HLS if requested
    if (options.generateHLS) {
      const hlsPlaylist = await generateHLSPlaylists(
        inputFile,
        path.basename(outputDir),
        path.basename(outputDir),
        options.hlsOptions
      );
      processedFiles.hls = hlsPlaylist;
    }
    
    const processingTime = Date.now() - startTime;
    
    logger.info(`Audio processing completed in ${processingTime}ms`);
    
    return {
      originalFile: inputFile,
      processedFiles,
      metadata,
      processingTime,
    };
  } catch (error) {
    logger.error('Error processing audio file:', error);
    throw error;
  }
};

/**
 * Extract audio metadata using FFprobe
 */
export const extractAudioMetadata = async (inputFile: string): Promise<AudioMetadata> => {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      inputFile
    ]);
    
    let output = '';
    let errorOutput = '';
    
    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ffprobe.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    ffprobe.on('close', (code) => {
      if (code !== 0) {
        logger.error('FFprobe error:', errorOutput);
        reject(new Error(`FFprobe failed with code ${code}`));
        return;
      }
      
      try {
        const metadata = JSON.parse(output);
        const audioStream = metadata.streams.find((stream: any) => stream.codec_type === 'audio');
        const format = metadata.format;
        
        if (!audioStream) {
          reject(new Error('No audio stream found'));
          return;
        }
        
        const audioMetadata: AudioMetadata = {
          duration: parseFloat(format.duration) || 0,
          bitrate: parseInt(format.bit_rate) || 0,
          sampleRate: parseInt(audioStream.sample_rate) || 0,
          channels: parseInt(audioStream.channels) || 0,
          format: format.format_name || 'unknown',
          codec: audioStream.codec_name || 'unknown',
          size: parseInt(format.size) || 0,
        };
        
        logger.info(`Extracted audio metadata:`, audioMetadata);
        resolve(audioMetadata);
      } catch (error) {
        logger.error('Error parsing FFprobe output:', error);
        reject(error);
      }
    });
  });
};

/**
 * Generate audio preview (30 seconds)
 */
export const generateAudioPreview = async (
  inputFile: string,
  outputDir: string,
  duration: number = 30,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputFile = path.join(outputDir, 'preview.mp3');
    const qualitySettings = getQualitySettings(quality);
    
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputFile,
      '-t', duration.toString(),
      '-c:a', 'libmp3lame',
      '-b:a', qualitySettings.bitrate.toString(),
      '-ar', qualitySettings.sampleRate.toString(),
      '-ac', '2',
      '-y', // Overwrite output file
      outputFile
    ]);
    
    let errorOutput = '';
    
    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        logger.error('FFmpeg preview generation error:', errorOutput);
        reject(new Error(`FFmpeg failed with code ${code}`));
        return;
      }
      
      logger.info(`Generated audio preview: ${outputFile}`);
      resolve(outputFile);
    });
  });
};

/**
 * Generate full quality audio
 */
export const generateFullAudio = async (
  inputFile: string,
  outputDir: string,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputFile = path.join(outputDir, 'full.mp3');
    const qualitySettings = getQualitySettings(quality);
    
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputFile,
      '-c:a', 'libmp3lame',
      '-b:a', qualitySettings.bitrate.toString(),
      '-ar', qualitySettings.sampleRate.toString(),
      '-ac', '2',
      '-y', // Overwrite output file
      outputFile
    ]);
    
    let errorOutput = '';
    
    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        logger.error('FFmpeg full audio generation error:', errorOutput);
        reject(new Error(`FFmpeg failed with code ${code}`));
        return;
      }
      
      logger.info(`Generated full audio: ${outputFile}`);
      resolve(outputFile);
    });
  });
};

/**
 * Generate HLS segments using FFmpeg
 */
export const generateHLSSegments = async (
  inputFile: string,
  outputDir: string,
  segmentDuration: number = 10,
  qualities: Array<{ name: string; bitrate: number; sampleRate: number }> = []
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const hlsDir = path.join(outputDir, 'hls');
    
    // Create HLS directory
    fs.mkdir(hlsDir, { recursive: true }).then(() => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputFile,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '44100',
        '-ac', '2',
        '-f', 'hls',
        '-hls_time', segmentDuration.toString(),
        '-hls_playlist_type', 'vod',
        '-hls_segment_filename', path.join(hlsDir, 'segment_%03d.ts'),
        path.join(hlsDir, 'playlist.m3u8')
      ]);
      
      let errorOutput = '';
      
      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          logger.error('FFmpeg HLS generation error:', errorOutput);
          reject(new Error(`FFmpeg failed with code ${code}`));
          return;
        }
        
        logger.info(`Generated HLS segments in: ${hlsDir}`);
        resolve();
      });
    }).catch(reject);
  });
};

/**
 * Get quality settings based on quality level
 */
const getQualitySettings = (quality: 'low' | 'medium' | 'high') => {
  switch (quality) {
    case 'low':
      return { bitrate: 64000, sampleRate: 22050 };
    case 'medium':
      return { bitrate: 128000, sampleRate: 44100 };
    case 'high':
      return { bitrate: 256000, sampleRate: 44100 };
    default:
      return { bitrate: 128000, sampleRate: 44100 };
  }
};

/**
 * Validate audio file format
 */
export const validateAudioFile = async (filePath: string): Promise<boolean> => {
  try {
    const metadata = await extractAudioMetadata(filePath);
    return metadata.duration > 0 && metadata.bitrate > 0;
  } catch (error) {
    logger.error('Error validating audio file:', error);
    return false;
  }
};

/**
 * Get audio file info
 */
export const getAudioFileInfo = async (filePath: string): Promise<{
  isValid: boolean;
  metadata?: AudioMetadata;
  error?: string;
}> => {
  try {
    const metadata = await extractAudioMetadata(filePath);
    return {
      isValid: true,
      metadata,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Convert audio format
 */
export const convertAudioFormat = async (
  inputFile: string,
  outputFile: string,
  outputFormat: 'mp3' | 'wav' | 'm4a' | 'flac',
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const qualitySettings = getQualitySettings(quality);
    const codec = getCodecForFormat(outputFormat);
    
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputFile,
      '-c:a', codec,
      '-b:a', qualitySettings.bitrate.toString(),
      '-ar', qualitySettings.sampleRate.toString(),
      '-ac', '2',
      '-y', // Overwrite output file
      outputFile
    ]);
    
    let errorOutput = '';
    
    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        logger.error('FFmpeg conversion error:', errorOutput);
        reject(new Error(`FFmpeg failed with code ${code}`));
        return;
      }
      
      logger.info(`Converted audio format: ${outputFile}`);
      resolve(outputFile);
    });
  });
};

/**
 * Get codec for output format
 */
const getCodecForFormat = (format: string): string => {
  switch (format) {
    case 'mp3':
      return 'libmp3lame';
    case 'wav':
      return 'pcm_s16le';
    case 'm4a':
      return 'aac';
    case 'flac':
      return 'flac';
    default:
      return 'libmp3lame';
  }
};

/**
 * Check if FFmpeg is available
 */
export const checkFFmpegAvailability = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    
    ffmpeg.on('close', (code) => {
      resolve(code === 0);
    });
    
    ffmpeg.on('error', () => {
      resolve(false);
    });
  });
};
