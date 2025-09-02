/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChunkedUploadProps {
  onUploadComplete: (result: UploadResult) => void;
  onUploadError: (error: string) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  beatId?: string;
  fileType: 'audio' | 'image' | 'profile' | 'artwork';
}

interface UploadResult {
  finalKey: string;
  downloadUrl: string;
  mediaFile: any;
}

interface UploadSession {
  sessionId: string;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: Set<number>;
}

interface UploadProgress {
  uploaded: number;
  total: number;
  percentage: number;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB max

export const ChunkedUpload: React.FC<ChunkedUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxFileSize = MAX_FILE_SIZE,
  allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac'],
  beatId,
  fileType,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ uploaded: 0, total: 0, percentage: 0 });
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds maximum allowed size of ${Math.round(maxFileSize / (1024 * 1024))}MB`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }
    
    return null;
  };

  const calculateFileChecksum = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const initializeUpload = async (file: File): Promise<UploadSession> => {
    const response = await fetch('/api/v1/media/chunked/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        fileType,
        beatId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to initialize upload');
    }

    const data = await response.json();
    return {
      sessionId: data.data.sessionId,
      chunkSize: data.data.chunkSize,
      totalChunks: data.data.totalChunks,
      uploadedChunks: new Set(),
    };
  };

  const uploadChunk = async (file: File, chunkIndex: number, session: UploadSession): Promise<void> => {
    const start = chunkIndex * session.chunkSize;
    const end = Math.min(start + session.chunkSize, file.size);
    const chunk = file.slice(start, end);

    // Get upload URL for this chunk
    const urlResponse = await fetch('/api/v1/media/chunked/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        sessionId: session.sessionId,
        chunkNumber: chunkIndex,
        chunkSize: session.chunkSize,
        totalChunks: session.totalChunks,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        fileType,
        beatId,
      }),
    });

    if (!urlResponse.ok) {
      const errorData = await urlResponse.json();
      throw new Error(errorData.error?.message || 'Failed to get upload URL');
    }

    const urlData = await urlResponse.json();

    // Upload chunk to R2
    const uploadResponse = await fetch(urlData.data.uploadUrl, {
      method: 'PUT',
      body: chunk,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload chunk ${chunkIndex}`);
    }

    // Mark chunk as uploaded
    await fetch('/api/v1/media/chunked/mark-uploaded', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        sessionId: session.sessionId,
        chunkNumber: chunkIndex,
      }),
    });
  };

  const completeUpload = async (file: File, session: UploadSession): Promise<UploadResult> => {
    const checksum = await calculateFileChecksum(file);

    const response = await fetch('/api/v1/media/chunked/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        sessionId: session.sessionId,
        checksum,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to complete upload');
    }

    const data = await response.json();
    return data.data;
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setCurrentFile(file);
    setError(null);
    setUploadStatus('idle');
    setUploadProgress({ uploaded: 0, total: 0, percentage: 0 });
  }, [maxFileSize, allowedTypes]);

  const handleUpload = useCallback(async () => {
    if (!currentFile) return;

    setIsUploading(true);
    setUploadStatus('uploading');
    setError(null);

    try {
      // Initialize upload session
      const session = await initializeUpload(currentFile);
      setUploadSession(session);
      setUploadProgress({ uploaded: 0, total: session.totalChunks, percentage: 0 });

      // Upload chunks
      for (let i = 0; i < session.totalChunks; i++) {
        await uploadChunk(currentFile, i, session);
        
        // Update progress
        const newProgress = {
          uploaded: i + 1,
          total: session.totalChunks,
          percentage: Math.round(((i + 1) / session.totalChunks) * 100),
        };
        setUploadProgress(newProgress);
      }

      // Complete upload
      const result = await completeUpload(currentFile, session);
      
      setUploadStatus('completed');
      onUploadComplete(result);
      
      toast({
        title: 'Upload Complete',
        description: 'Your file has been uploaded successfully!',
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      setUploadStatus('error');
      onUploadError(errorMessage);
      
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [currentFile, onUploadComplete, onUploadError, toast]);

  const handleAbort = useCallback(async () => {
    if (!uploadSession) return;

    try {
      await fetch(`/api/v1/media/chunked/${uploadSession.sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
    } catch (error) {
      console.error('Failed to abort upload:', error);
    }

    setIsUploading(false);
    setUploadStatus('idle');
    setUploadProgress({ uploaded: 0, total: 0, percentage: 0 });
    setUploadSession(null);
  }, [uploadSession]);

  const handleReset = useCallback(() => {
    setCurrentFile(null);
    setUploadSession(null);
    setUploadProgress({ uploaded: 0, total: 0, percentage: 0 });
    setError(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <AlertCircle className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <Upload className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Chunked File Upload
        </CardTitle>
        <CardDescription>
          Upload large files with progress tracking and resumable uploads
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <label htmlFor="file-input" className="text-sm font-medium">
            Select File
          </label>
          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="w-full p-2 border border-gray-300 rounded-md disabled:opacity-50"
          />
        </div>

        {/* File Info */}
        {currentFile && (
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm">
              <div><strong>Name:</strong> {currentFile.name}</div>
              <div><strong>Size:</strong> {(currentFile.size / (1024 * 1024)).toFixed(2)} MB</div>
              <div><strong>Type:</strong> {currentFile.type}</div>
            </div>
          </div>
        )}

        {/* Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Upload Progress</span>
              <span>{uploadProgress.percentage}%</span>
            </div>
            <Progress value={uploadProgress.percentage} className="w-full" />
            <div className="text-xs text-gray-500">
              {uploadProgress.uploaded} of {uploadProgress.total} chunks uploaded
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!isUploading && currentFile && uploadStatus !== 'completed' && (
            <Button onClick={handleUpload} className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          )}
          
          {isUploading && (
            <Button onClick={handleAbort} variant="destructive" className="flex-1">
              <XCircle className="h-4 w-4 mr-2" />
              Abort Upload
            </Button>
          )}
          
          {(uploadStatus === 'completed' || uploadStatus === 'error') && (
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Upload Another File
            </Button>
          )}
        </div>

        {/* Upload Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB</div>
          <div>• Chunk size: {Math.round(CHUNK_SIZE / (1024 * 1024))}MB</div>
          <div>• Supported formats: {allowedTypes.join(', ')}</div>
        </div>
      </CardContent>
    </Card>
  );
};
