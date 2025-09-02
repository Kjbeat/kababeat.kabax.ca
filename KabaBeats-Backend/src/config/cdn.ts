import { logger } from './logger';

export interface CDNConfig {
  provider: 'cloudflare' | 'aws-cloudfront' | 'custom';
  baseUrl: string;
  cacheSettings: {
    defaultTTL: number;
    maxTTL: number;
    minTTL: number;
  };
  streamingSettings: {
    enableHLS: boolean;
    enableDASH: boolean;
    segmentDuration: number;
  };
}

export interface CDNResponse {
  success: boolean;
  url?: string;
  error?: string;
}

class CDNService {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  /**
   * Generate CDN URL for a file
   */
  generateCDNUrl(fileKey: string, options: {
    expiresIn?: number;
    quality?: string;
    format?: string;
  } = {}): string {
    try {
      const { baseUrl } = this.config;
      let url = `${baseUrl}/${fileKey}`;

      // Add query parameters for CDN optimization
      const params = new URLSearchParams();
      
      if (options.expiresIn) {
        params.append('expires', (Date.now() + options.expiresIn * 1000).toString());
      }
      
      if (options.quality) {
        params.append('quality', options.quality);
      }
      
      if (options.format) {
        params.append('format', options.format);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      logger.info(`Generated CDN URL: ${url}`);
      return url;
    } catch (error) {
      logger.error('Error generating CDN URL:', error);
      throw error;
    }
  }

  /**
   * Generate HLS streaming URL
   */
  generateHLSStreamingUrl(beatId: string, userId: string, options: {
    quality?: string;
    expiresIn?: number;
  } = {}): string {
    try {
      const { baseUrl } = this.config;
      const hlsPath = `processed/hls/${userId}/${beatId}`;
      
      let url: string;
      if (options.quality) {
        url = `${baseUrl}/${hlsPath}/${options.quality}/playlist.m3u8`;
      } else {
        url = `${baseUrl}/${hlsPath}/master/playlist.m3u8`;
      }

      // Add CDN-specific parameters
      const params = new URLSearchParams();
      
      if (options.expiresIn) {
        params.append('expires', (Date.now() + options.expiresIn * 1000).toString());
      }
      
      // Add cache control headers
      params.append('cache', 'public');
      params.append('max-age', this.config.cacheSettings.defaultTTL.toString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      logger.info(`Generated HLS streaming URL: ${url}`);
      return url;
    } catch (error) {
      logger.error('Error generating HLS streaming URL:', error);
      throw error;
    }
  }

  /**
   * Purge CDN cache for a specific file
   */
  async purgeCache(fileKey: string): Promise<CDNResponse> {
    try {
      // This would integrate with your CDN provider's API
      // For now, we'll simulate the response
      
      logger.info(`Purging CDN cache for: ${fileKey}`);
      
      // In a real implementation, you would:
      // 1. Call your CDN provider's purge API
      // 2. Handle the response
      // 3. Return appropriate status
      
      return {
        success: true,
        url: fileKey,
      };
    } catch (error) {
      logger.error('Error purging CDN cache:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get CDN statistics
   */
  async getCDNStats(): Promise<{
    totalRequests: number;
    cacheHitRate: number;
    bandwidth: number;
    errors: number;
  }> {
    try {
      // This would integrate with your CDN provider's analytics API
      // For now, we'll return mock data
      
      return {
        totalRequests: 0,
        cacheHitRate: 0.95,
        bandwidth: 0,
        errors: 0,
      };
    } catch (error) {
      logger.error('Error getting CDN stats:', error);
      throw error;
    }
  }

  /**
   * Configure cache headers for different file types
   */
  getCacheHeaders(fileType: 'audio' | 'image' | 'hls' | 'static'): Record<string, string> {
    const { cacheSettings } = this.config;
    
    switch (fileType) {
      case 'audio':
        return {
          'Cache-Control': `public, max-age=${cacheSettings.maxTTL}`,
          'Expires': new Date(Date.now() + cacheSettings.maxTTL * 1000).toUTCString(),
        };
      
      case 'image':
        return {
          'Cache-Control': `public, max-age=${cacheSettings.maxTTL}`,
          'Expires': new Date(Date.now() + cacheSettings.maxTTL * 1000).toUTCString(),
        };
      
      case 'hls':
        return {
          'Cache-Control': `public, max-age=${cacheSettings.defaultTTL}`,
          'Content-Type': 'application/vnd.apple.mpegurl',
        };
      
      case 'static':
        return {
          'Cache-Control': `public, max-age=${cacheSettings.maxTTL}`,
          'Expires': new Date(Date.now() + cacheSettings.maxTTL * 1000).toUTCString(),
        };
      
      default:
        return {
          'Cache-Control': `public, max-age=${cacheSettings.defaultTTL}`,
        };
    }
  }
}

// CDN Configuration
const cdnConfig: CDNConfig = {
  provider: 'cloudflare',
  baseUrl: process.env.CDN_BASE_URL || 'https://media.kababeat.kabax.ca',
  cacheSettings: {
    defaultTTL: 3600, // 1 hour
    maxTTL: 86400,    // 24 hours
    minTTL: 300,      // 5 minutes
  },
  streamingSettings: {
    enableHLS: true,
    enableDASH: false,
    segmentDuration: 10,
  },
};

// Create CDN service instance
export const cdnService = new CDNService(cdnConfig);

// Helper functions
export const generateCDNUrl = (fileKey: string, options?: {
  expiresIn?: number;
  quality?: string;
  format?: string;
}): string => {
  return cdnService.generateCDNUrl(fileKey, options);
};

export const generateHLSStreamingUrl = (beatId: string, userId: string, options?: {
  quality?: string;
  expiresIn?: number;
}): string => {
  return cdnService.generateHLSStreamingUrl(beatId, userId, options);
};

export const getCacheHeaders = (fileType: 'audio' | 'image' | 'hls' | 'static'): Record<string, string> => {
  return cdnService.getCacheHeaders(fileType);
};

export const purgeCDNCache = async (fileKey: string): Promise<CDNResponse> => {
  return await cdnService.purgeCache(fileKey);
};

export const getCDNStats = async () => {
  return await cdnService.getCDNStats();
};
