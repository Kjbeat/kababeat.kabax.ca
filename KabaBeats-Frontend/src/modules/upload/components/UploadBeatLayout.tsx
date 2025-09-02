/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

import { FileUploadStep } from "./FileUploadStep";
import { ArtworkUploadStep } from "./ArtworkUploadStep";
import { BeatInfoStep } from "./BeatInfoStep";
import { CollaboratorSplitStep } from "./CollaboratorSplitStep";
import { ReviewStep } from "./ReviewStep";
import { ProgressStep } from "./ProgressStep";
import { AIUploadDialog, AIUploadConfig } from "./AIUploadDialog";
import { ScheduleDialog } from "./ScheduleDialog";
import { PostActionDialog } from "./PostActionDialog";
import { BeatFormData, DEFAULT_FORM_DATA, ActionType } from "../types";
import { UploadProgress, BEAT_UPLOAD_STEPS, UploadStep } from "@/components/ui/upload-progress";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export function UploadBeatLayout() {
  const { t } = useLanguage();
  const { user, accessToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BeatFormData>(DEFAULT_FORM_DATA);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSteps, setUploadSteps] = useState<UploadStep[]>(BEAT_UPLOAD_STEPS);
  const [currentUploadStep, setCurrentUploadStep] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);
  
  // Dialog states
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [postActionOpen, setPostActionOpen] = useState(false);
  
  // AI processing states
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiSteps, setAiSteps] = useState<string[]>([]);
  const [aiCurrentStep, setAiCurrentStep] = useState(0);
  
  // Action states
  const [lastAction, setLastAction] = useState<ActionType>(null);
  const defaultSchedule = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0,16);
  const [scheduleAt, setScheduleAt] = useState<string>(defaultSchedule);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // New 5 step flow: 1 Audio, 2 Artwork, 3 Beat Info, 4 Splits, 5 Review
  const totalSteps = 5;
  const stepLabels = [t('upload.steps.audio'), t('upload.steps.artwork'), t('upload.steps.beatInfo'), t('upload.steps.splits'), t('upload.steps.review')];

  const { toast } = useToast();
  const navigate = useNavigate();

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (type: 'audio' | 'artwork' | 'stems') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    if (file) {
      setFormData(prev => {
        const newData = {
          ...prev,
          [type === 'audio' ? 'audioFile' : type === 'artwork' ? 'artwork' : 'stemsFile']: file
        };
        console.log('Updated form data:', newData);
        return newData;
      });
    }
  };

  const handleRemoveFile = (type: 'audio' | 'artwork' | 'stems') => () => {
    setFormData(prev => ({
      ...prev,
      [type === 'audio' ? 'audioFile' : type === 'artwork' ? 'artwork' : 'stemsFile']: null
    }));
  };

  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  // Helper function to update upload steps
  const updateUploadStep = (stepId: string, status: 'pending' | 'in-progress' | 'completed' | 'error', progress?: number) => {
    setUploadSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress }
        : step
    ));
  };

  // Helper function to reset upload progress
  const resetUploadProgress = () => {
    setUploadSteps(BEAT_UPLOAD_STEPS);
    setCurrentUploadStep(0);
    setUploadProgress(0);
    setUploadError(null);
  };

  // AI Upload handlers
  const handleAiUpload = () => {
    setAiDialogOpen(true);
  };

  const computeAISteps = (config: AIUploadConfig) => {
    const steps = [t('upload.ai.steps.findingBpm'), t('upload.ai.steps.detectingKey'), t('upload.ai.steps.classifyingGenre'), t('upload.ai.steps.inferringMood'), t('upload.ai.steps.writingDescription'), t('upload.ai.steps.suggestingTags')];
    if (config.autoTitle) steps.push(t('upload.ai.steps.generatingTitle'));
    if (config.autoArtwork) steps.push(t('upload.ai.steps.generatingArtwork'));
    return steps;
  };

  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const getPlaceholderArtworkFile = async (): Promise<File | null> => {
    try {
      const url = "/lovable-uploads/ac59b84f-e1b5-4401-ba5c-0183111473ce.png";
      const resp = await fetch(url);
      const blob = await resp.blob();
      return new File([blob], "ai-artwork.png", { type: blob.type || "image/png" });
    } catch {
      return null;
    }
  };

  const handleAiProcess = async (config: AIUploadConfig) => {
    setAiProcessing(true);
    const steps = computeAISteps(config);
    setAiSteps(steps);
    
    for (let i = 0; i < steps.length; i++) {
      setAiCurrentStep(i);
      await wait(800);
    }
    
    const artworkFile = config.autoArtwork ? await getPlaceholderArtworkFile() : config.artworkFile;
    const aiGeneratedData = {
      title: config.autoTitle ? "Neon Drip" : config.title || formData.title,
      bpm: "142",
      key: "F#",
      genre: "Trap",
      mood: "Energetic",
      description: "Hard-hitting trap beat with punchy 808s, crisp hats, and atmospheric pads.",
      tags: ["trap", "808", "dark", "energetic"],
    };
    
    setFormData(prev => ({
      ...prev,
      ...aiGeneratedData,
      audioFile: config.audioFile || prev.audioFile,
      artwork: artworkFile || prev.artwork,
    }));
    
    setAiProcessing(false);
    setAiDialogOpen(false);
  // After AI processing jump to Beat Info (step 3) so user can review/edit metadata
  setCurrentStep(3);
  };

  // Action handlers
  const resetToStepOne = () => {
    setFormData(DEFAULT_FORM_DATA);
    setCurrentStep(1);
  };

  const openPostAction = (action: ActionType) => {
    setLastAction(action);
    setPostActionOpen(true);
  };

  const handlePublish = async () => {
    console.log('Current form data:', formData);
    console.log('Audio file:', formData.audioFile);
    
    if (!formData.audioFile) {
      toast({ 
        title: "Error", 
        description: "Please upload an audio file first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      resetUploadProgress();
      setUploadError(null);

      // Step 1: Upload files
      updateUploadStep('upload-files', 'in-progress', 0);
      setCurrentUploadStep(0);
      
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add audio file
      console.log('Adding audio file to FormData:', formData.audioFile);
      formDataToSend.append('audio', formData.audioFile);
      
      // Add artwork if provided
      if (formData.artwork) {
        formDataToSend.append('artwork', formData.artwork);
      }
      
      // Add stems if provided
      if (formData.stemsFile) {
        formDataToSend.append('stems', formData.stemsFile);
      }
      
      // Add beat metadata
      formDataToSend.append('title', formData.title);
      formDataToSend.append('producer', user?.username || user?.firstName || 'Unknown');
      formDataToSend.append('bpm', (parseInt(formData.bpm) || 120).toString());
      formDataToSend.append('key', formData.key);
      formDataToSend.append('genre', formData.genre);
      if (formData.mood) formDataToSend.append('mood', formData.mood);
      if (formData.description) formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('allowFreeDownload', (formData.allowFreeDownload || false).toString());
      formDataToSend.append('status', 'published');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 20) {
            clearInterval(progressInterval);
            updateUploadStep('upload-files', 'completed');
            updateUploadStep('process-audio', 'in-progress', 0);
            setCurrentUploadStep(1);
            return 20;
          }
          return prev + 2;
        });
      }, 100);

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      // Step 2: Process audio
      setTimeout(() => {
        updateUploadStep('process-audio', 'completed');
        updateUploadStep('process-artwork', 'in-progress', 0);
        setCurrentUploadStep(2);
        setUploadProgress(40);
      }, 1000);

      // Step 3: Process artwork
      setTimeout(() => {
        updateUploadStep('process-artwork', 'completed');
        updateUploadStep('save-database', 'in-progress', 0);
        setCurrentUploadStep(3);
        setUploadProgress(60);
      }, 1500);

      // Step 4: Save to database
      setTimeout(() => {
        updateUploadStep('save-database', 'completed');
        updateUploadStep('make-live', 'in-progress', 0);
        setCurrentUploadStep(4);
        setUploadProgress(80);
      }, 2000);

      const beat = await createBeat(formDataToSend);

      // Step 5: Make live
      updateUploadStep('make-live', 'completed');
      setUploadProgress(100);

      toast({ 
        title: "Beat published", 
        description: "Your beat is live and processing for streaming." 
      });
      openPostAction("published");
    } catch (error) {
      console.error('Error publishing beat:', error);
      setUploadError('Failed to publish beat. Please try again.');
      updateUploadStep('upload-files', 'error');
      toast({ 
        title: "Error", 
        description: "Failed to publish beat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.audioFile) {
      toast({ 
        title: "Error", 
        description: "Please upload an audio file first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add audio file
      formDataToSend.append('audio', formData.audioFile);
      
      // Add artwork if provided
      if (formData.artwork) {
        formDataToSend.append('artwork', formData.artwork);
      }
      
      // Add beat metadata
      formDataToSend.append('title', formData.title);
      formDataToSend.append('producer', user?.username || user?.firstName || 'Unknown');
      formDataToSend.append('bpm', (parseInt(formData.bpm) || 120).toString());
      formDataToSend.append('key', formData.key);
      formDataToSend.append('genre', formData.genre);
      if (formData.mood) formDataToSend.append('mood', formData.mood);
      if (formData.description) formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('allowFreeDownload', (formData.allowFreeDownload || false).toString());
      formDataToSend.append('status', 'draft'); // Set status to draft for handleSaveDraft

      const beat = await createBeat(formDataToSend);

      toast({ 
        title: "Draft saved", 
        description: "Your beat was saved as a draft." 
      });
      openPostAction("drafted");
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSchedule = () => {
    setScheduleOpen(true);
  };

  const confirmSchedule = async () => {
    if (!formData.audioFile) {
      toast({ 
        title: "Error", 
        description: "Please upload an audio file first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add audio file
      formDataToSend.append('audio', formData.audioFile);
      
      // Add artwork if provided
      if (formData.artwork) {
        formDataToSend.append('artwork', formData.artwork);
      }
      
      // Add beat metadata
      formDataToSend.append('title', formData.title);
      formDataToSend.append('producer', user?.username || user?.firstName || 'Unknown');
      formDataToSend.append('bpm', (parseInt(formData.bpm) || 120).toString());
      formDataToSend.append('key', formData.key);
      formDataToSend.append('genre', formData.genre);
      if (formData.mood) formDataToSend.append('mood', formData.mood);
      if (formData.description) formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('allowFreeDownload', (formData.allowFreeDownload || false).toString());
      formDataToSend.append('scheduledDate', new Date(scheduleAt).toISOString());
      formDataToSend.append('status', 'scheduled'); // Set status to scheduled for confirmSchedule

      const beat = await createBeat(formDataToSend);

      setScheduleOpen(false);
      toast({ 
        title: "Beat scheduled", 
        description: `Scheduled for ${new Date(scheduleAt).toLocaleString()}` 
      });
      openPostAction("scheduled");
    } catch (error) {
      console.error('Error scheduling beat:', error);
      toast({ 
        title: "Error", 
        description: "Failed to schedule beat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleGoToMyBeats = () => {
    setPostActionOpen(false);
    navigate('/my-beats');
  };

  const handleUploadAnother = () => {
    setPostActionOpen(false);
    resetToStepOne();
  };



  const createBeat = async (beatData: FormData) => {
    if (!accessToken) throw new Error('User not authenticated');
    
    console.log('Sending request to:', `${API_BASE_URL}/beats`);
    console.log('Access token available:', !!accessToken);
    console.log('FormData entries:');
    for (const [key, value] of beatData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }
    
    const response = await fetch(`${API_BASE_URL}/beats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: beatData
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.error?.message || 'Failed to create beat');
    }

    const data = await response.json();
    console.log('Success response:', data);
    return data.data;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileUploadStep
            formData={formData}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            onAiUpload={handleAiUpload}
          />
        );
      case 2:
        return (
          <ArtworkUploadStep
            formData={formData}
            onFormDataChange={handleFormDataChange as any}
          />
        );
      case 3:
        return (
          <BeatInfoStep
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onAddTag={addTag}
            onRemoveTag={removeTag}
          />
        );
      case 4:
        return (
          <CollaboratorSplitStep
            formData={formData}
            onFormDataChange={handleFormDataChange as any}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            onSchedule={handleSchedule}
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('upload.title')}</h1>
          <p className="text-muted-foreground">{t('upload.description')}</p>
        </div>

        {/* Progress Bar */}
        <ProgressStep 
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
        />

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6">
            <UploadProgress
              steps={uploadSteps}
              currentStep={currentUploadStep}
              overallProgress={uploadProgress}
              isUploading={isUploading}
              error={uploadError}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isUploading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('upload.previous')}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isUploading}
            >
              {t('upload.saveAsDraft')}
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} disabled={isUploading}>
                {t('upload.next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handlePublish} 
                disabled={!termsAccepted || isUploading} 
                title={!termsAccepted ? t('upload.acceptTermsToPublish') : undefined}
              >
                {isUploading ? 'Publishing...' : t('upload.publishBeat')}
              </Button>
            )}
          </div>
        </div>

        {/* AI Upload Dialog */}
        <AIUploadDialog
          isOpen={aiDialogOpen}
          onClose={() => setAiDialogOpen(false)}
          onProcess={handleAiProcess}
          isProcessing={aiProcessing}
          processingSteps={aiSteps}
          currentProcessingStep={aiCurrentStep}
        />

        {/* Schedule Dialog */}
        <ScheduleDialog
          isOpen={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          onConfirm={confirmSchedule}
          scheduleDateTime={scheduleAt}
          onScheduleDateTimeChange={setScheduleAt}
        />

        {/* Post-action Dialog */}
        <PostActionDialog
          isOpen={postActionOpen}
          onClose={() => setPostActionOpen(false)}
          lastAction={lastAction}
          onUploadAnother={handleUploadAnother}
          onGoToMyBeats={handleGoToMyBeats}
        />
      </div>
    </div>
  );
}
