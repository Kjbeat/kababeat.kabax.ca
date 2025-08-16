/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

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

export function UploadBeatLayout() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BeatFormData>(DEFAULT_FORM_DATA);
  
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

  const handleFileUpload = (type: 'audio' | 'artwork') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type === 'audio' ? 'audioFile' : 'artwork']: file
      }));
    }
  };

  const handleRemoveFile = (type: 'audio' | 'artwork') => () => {
    setFormData(prev => ({
      ...prev,
      [type === 'audio' ? 'audioFile' : 'artwork']: null
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

  const handlePublish = () => {
    toast({ title: "Beat published", description: "Your beat is live." });
    openPostAction("published");
  };

  const handleSaveDraft = () => {
    toast({ title: "Draft saved", description: "Your beat was saved as a draft." });
    openPostAction("drafted");
  };

  const handleSchedule = () => {
    setScheduleOpen(true);
  };

  const confirmSchedule = () => {
    setScheduleOpen(false);
    toast({ 
      title: "Beat scheduled", 
      description: `Scheduled for ${new Date(scheduleAt).toLocaleString()}` 
    });
    openPostAction("scheduled");
  };

  const handleGoToMyBeats = () => {
    setPostActionOpen(false);
    navigate('/my-beats');
  };

  const handleUploadAnother = () => {
    setPostActionOpen(false);
    resetToStepOne();
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

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('upload.previous')}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              {t('upload.saveAsDraft')}
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                {t('upload.next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handlePublish} disabled={!termsAccepted} title={!termsAccepted ? t('upload.acceptTermsToPublish') : undefined}>
                {t('upload.publishBeat')}
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
