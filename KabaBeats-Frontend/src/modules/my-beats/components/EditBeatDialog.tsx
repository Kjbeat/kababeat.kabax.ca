/* EditBeatDialog: Reuses upload steps for editing an existing beat.
   Starts at step 2 (Artwork) with prefilled data. */
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ArtworkUploadStep } from '@/modules/upload/components/ArtworkUploadStep';
import { BeatInfoStep } from '@/modules/upload/components/BeatInfoStep';
import { CollaboratorSplitStep } from '@/modules/upload/components/CollaboratorSplitStep';
import { ReviewStep } from '@/modules/upload/components/ReviewStep';
import { FileUploadStep } from '@/modules/upload/components/FileUploadStep';
import { ProgressStep } from '@/modules/upload/components/ProgressStep';
import { ScheduleDialog } from '@/modules/upload/components/ScheduleDialog';
import { BeatFormData, DEFAULT_FORM_DATA } from '@/modules/upload/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Beat } from '@/interface-types/media-player';

interface EditBeatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beat: Beat | null;
  onSave: (updated: Partial<Beat>) => void;
  onSaveWithFiles: (updated: Partial<Beat>) => void; // For file uploads
  onRefresh: () => void; // Add refresh callback
}

function mapBeatToFormData(beat: Beat | null): BeatFormData {
  if (!beat) return DEFAULT_FORM_DATA;
  
  return {
    ...DEFAULT_FORM_DATA,
    title: beat.title,
    bpm: String(beat.bpm),
    key: beat.key?.split(' ')[0] || '',
    genre: beat.genre,
    description: beat.description || '',
    mood: beat.mood || '',
    tags: beat.tags || [],
    audioFile: null,
    artwork: null, // Will be handled by existingArtworkUrl prop in ArtworkUploadStep
    allowFreeDownload: beat.allowFreeDownload || false,
    collaborators: beat.collaborators || []
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export function EditBeatDialog({ open, onOpenChange, beat, onSave, onSaveWithFiles, onRefresh }: EditBeatDialogProps) {
  // Editing flow now includes file upload; start at File Upload as step 1.
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BeatFormData>(() => mapBeatToFormData(beat));
  const [termsAccepted, setTermsAccepted] = useState(true); // assume already accepted when editing
  const [isSaving, setIsSaving] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState<string>('');
  const { t } = useLanguage();
  const { accessToken } = useAuth();
  const { toast } = useToast();

  // Memoize URLs to prevent unnecessary re-renders
  const existingAudioUrl = useMemo(() => 
    beat?.storageKey ? `https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev/${beat.storageKey}` : undefined,
    [beat?.storageKey]
  );
  
  const existingStemsUrl = useMemo(() => 
    beat?.stemsStorageKey ? `https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev/${beat.stemsStorageKey}` : undefined,
    [beat?.stemsStorageKey]
  );
  
  const existingArtworkUrl = useMemo(() => 
    beat?.artwork ? `https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev/${beat.artwork}` : undefined,
    [beat?.artwork]
  );

  // Reset form when beat changes or dialog reopens
  useEffect(() => { setFormData(mapBeatToFormData(beat)); setCurrentStep(1); }, [beat, open]);
  // NOTE: We avoid directly manipulating aria-hidden. If future need arises to visually hide
  // background while keeping accessibility, consider applying `inert` to root siblings instead.

  const totalSteps = 5;
  const stepLabels = [t('editBeat.files'), t('editBeat.artwork'), t('editBeat.beatInfo'), t('editBeat.splits'), t('editBeat.review')];

  const handleFormDataChange: (field: keyof BeatFormData, value: unknown) => void = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const addTag = (tag: string) => { if (!formData.tags.includes(tag)) setFormData(p => ({...p,tags:[...p.tags, tag]})); };
  const removeTag = (tag: string) => setFormData(p => ({...p, tags: p.tags.filter(t => t!== tag)}));

  const nextStep = () => { if (currentStep < totalSteps) setCurrentStep(s => s + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const handleSave = async (status?: 'draft' | 'published' | 'scheduled', scheduledDate?: Date) => {
    if (!beat || !accessToken) return;
    
    console.log('🎵 EditBeatDialog: Starting save process...', { status, scheduledDate });
    setIsSaving(true);
    
    try {
      // Check if we have files to upload
      const hasNewFiles = formData.audioFile || formData.artwork || formData.stemsFile;
      console.log('🎵 EditBeatDialog: Has new files?', hasNewFiles);
      console.log('🎵 EditBeatDialog: Audio file:', formData.audioFile?.name);
      console.log('🎵 EditBeatDialog: Artwork file:', formData.artwork?.name);
      console.log('🎵 EditBeatDialog: Stems file:', formData.stemsFile?.name);
      
      if (hasNewFiles) {
        console.log('🎵 EditBeatDialog: Using FormData upload with files...');
        // Handle file uploads with FormData
        const formDataToSend = new FormData();
        
        // Add files if they exist
        if (formData.audioFile) {
          formDataToSend.append('audio', formData.audioFile);
        }
        if (formData.artwork) {
          formDataToSend.append('artwork', formData.artwork);
        }
        if (formData.stemsFile) {
          formDataToSend.append('stems', formData.stemsFile);
        }
        
        // Add metadata
        formDataToSend.append('title', formData.title || beat.title);
        formDataToSend.append('bpm', (Number(formData.bpm) || beat.bpm).toString());
        formDataToSend.append('key', formData.key ? `${formData.key} Minor` : beat.key);
        formDataToSend.append('genre', formData.genre || beat.genre);
        if (formData.description) formDataToSend.append('description', formData.description);
        if (formData.mood) formDataToSend.append('mood', formData.mood);
        formDataToSend.append('tags', JSON.stringify(formData.tags || beat.tags));
        formDataToSend.append('allowFreeDownload', (formData.allowFreeDownload !== undefined ? formData.allowFreeDownload : beat.allowFreeDownload).toString());
        formDataToSend.append('collaborators', JSON.stringify(formData.collaborators || beat.collaborators));
        
        // Add status if provided
        if (status) {
          formDataToSend.append('status', status);
        }
        if (scheduledDate) {
          formDataToSend.append('scheduledDate', scheduledDate.toISOString());
        }
        
        console.log('🎵 EditBeatDialog: Sending FormData to:', `${API_BASE_URL}/beats/${beat._id || beat.id}/files`);
        console.log('🎵 EditBeatDialog: FormData contents:');
        for (const [key, value] of formDataToSend.entries()) {
          console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
        }
        
        const response = await fetch(`${API_BASE_URL}/beats/${beat._id || beat.id}/files`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`
            // Don't set Content-Type for FormData
          },
          body: formDataToSend
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to update beat');
        }
        
        const data = await response.json();
        console.log('🎵 EditBeatDialog: File upload response:', data);
        onSaveWithFiles(data.data); // Use the file upload handler
      } else {
        console.log('🎵 EditBeatDialog: No files, using JSON metadata update...');
        // No files, just update metadata
        const updateData: Partial<Beat> = {
          _id: beat._id,
          id: beat.id,
          title: formData.title || beat.title,
          bpm: Number(formData.bpm) || beat.bpm,
          key: formData.key ? `${formData.key} Minor` : beat.key,
          genre: formData.genre || beat.genre,
          description: formData.description || beat.description,
          mood: formData.mood || beat.mood,
          tags: formData.tags || beat.tags,
          allowFreeDownload: formData.allowFreeDownload !== undefined ? formData.allowFreeDownload : beat.allowFreeDownload,
          collaborators: formData.collaborators || beat.collaborators,
        };
        
        // Add status if provided
        if (status) {
          updateData.status = status;
        }
        if (scheduledDate) {
          updateData.scheduledDate = scheduledDate;
        }
        
        onSave(updateData);
      }
      
      const statusMessage = status === 'draft' ? 'saved as draft' : 
                           status === 'published' ? 'published' : 
                           status === 'scheduled' ? 'scheduled' : 'updated';
      
      toast({
        title: "Success",
        description: `Beat ${statusMessage} successfully.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating beat:', error);
      toast({
        title: "Error",
        description: "Failed to update beat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle different save actions
  const handleSaveDraft = () => handleSave('draft');
  const handlePublish = () => handleSave('published');
  const handleSchedule = () => {
    // Show the schedule dialog to let user pick date and time
    setScheduleDateTime(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setShowScheduleDialog(true);
  };

  // Handle schedule confirmation
  const handleScheduleConfirm = () => {
    if (scheduleDateTime) {
      handleSave('scheduled', new Date(scheduleDateTime));
      setShowScheduleDialog(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <FileUploadStep formData={formData} onFormDataChange={handleFormDataChange} existingAudioUrl={existingAudioUrl} existingStemsUrl={existingStemsUrl} />;
      case 2: return <ArtworkUploadStep formData={formData} onFormDataChange={handleFormDataChange} existingArtworkUrl={existingArtworkUrl} />;
      case 3: return <BeatInfoStep formData={formData} onFormDataChange={handleFormDataChange} onAddTag={addTag} onRemoveTag={removeTag} />;
      case 4: return <CollaboratorSplitStep formData={formData} onFormDataChange={handleFormDataChange} />;
      case 5: return <ReviewStep formData={formData} onPublish={handlePublish} onSaveDraft={handleSaveDraft} onSchedule={handleSchedule} termsAccepted={termsAccepted} onTermsChange={setTermsAccepted} existingArtworkUrl={existingArtworkUrl} />;
      default: return null;
    }
  };

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col p-0 sm:rounded-lg rounded-none">
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-2 border-b">
          <DialogTitle>{t('editBeat.title')}</DialogTitle>
          <DialogDescription>{t('editBeat.description')}</DialogDescription>
        </DialogHeader>
        <div className="px-4 sm:px-6 pt-4">
          <div className="scale-[.9] origin-left sm:scale-100">
            <ProgressStep currentStep={currentStep} totalSteps={totalSteps} stepLabels={stepLabels} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {renderStepContent()}
        </div>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t bg-background gap-3 flex-wrap sticky bottom-0">
          <div className="flex gap-2 order-2 sm:order-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t('editBeat.cancel')}</Button>
            <Button variant="outline" disabled={currentStep === 1} onClick={prevStep}>
              <ChevronLeft className="h-4 w-4 mr-2" />{t('editBeat.prev')}
            </Button>
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            {currentStep < totalSteps && (
              <Button onClick={nextStep}>{t('editBeat.next')}<ChevronRight className="h-4 w-4 ml-2" /></Button>
            )}
            <Button onClick={() => handleSave()} variant={currentStep < totalSteps ? 'secondary' : 'default'} disabled={isSaving}>
              {isSaving ? 'Saving...' : t('editBeat.saveChanges')}
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* Schedule Dialog */}
      <ScheduleDialog
        isOpen={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        onConfirm={handleScheduleConfirm}
        scheduleDateTime={scheduleDateTime}
        onScheduleDateTimeChange={setScheduleDateTime}
      />
    </Dialog>
  );
}
