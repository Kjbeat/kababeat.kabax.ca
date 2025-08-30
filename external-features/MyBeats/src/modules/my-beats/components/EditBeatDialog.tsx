/* EditBeatDialog: Reuses upload steps for editing an existing beat.
   Starts at step 2 (Artwork) with prefilled data. */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ArtworkUploadStep } from '../../upload/components/ArtworkUploadStep';
import { BeatInfoStep } from '../../upload/components/BeatInfoStep';
import { CollaboratorSplitStep } from '../../upload/components/CollaboratorSplitStep';
import { ReviewStep } from '../../upload/components/ReviewStep';
import { ProgressStep } from '../../upload/components/ProgressStep';
import { BeatFormData, DEFAULT_FORM_DATA } from '../../upload/types';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Beat } from './mockBeats';

interface EditBeatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beat: Beat | null;
  onSave: (updated: Partial<Beat>) => void;
}

function mapBeatToFormData(beat: Beat | null): BeatFormData {
  if (!beat) return DEFAULT_FORM_DATA;
  return {
    ...DEFAULT_FORM_DATA,
    title: beat.title,
    bpm: String(beat.bpm),
    key: beat.key.split(' ')[0],
    genre: beat.genre,
    description: '',
    mood: '',
    tags: [],
    audioFile: null,
    artwork: null, // Could attempt to fetch and convert but not needed for edit metadata
    allowFreeDownload: false,
    collaborators: []
  };
}

export function EditBeatDialog({ open, onOpenChange, beat, onSave }: EditBeatDialogProps) {
  // Editing flow excludes original audio upload; start at Artwork as step 1.
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BeatFormData>(() => mapBeatToFormData(beat));
  const [termsAccepted, setTermsAccepted] = useState(true); // assume already accepted when editing
  const { t } = useLanguage();

  // Reset form when beat changes or dialog reopens
  useEffect(() => { setFormData(mapBeatToFormData(beat)); setCurrentStep(1); }, [beat, open]);
  // NOTE: We avoid directly manipulating aria-hidden. If future need arises to visually hide
  // background while keeping accessibility, consider applying `inert` to root siblings instead.

  const totalSteps = 4;
  const stepLabels = [t('editBeat.artwork'), t('editBeat.beatInfo'), t('editBeat.splits'), t('editBeat.review')];

  const handleFormDataChange: (field: keyof BeatFormData, value: unknown) => void = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const addTag = (tag: string) => { if (!formData.tags.includes(tag)) setFormData(p => ({...p,tags:[...p.tags, tag]})); };
  const removeTag = (tag: string) => setFormData(p => ({...p, tags: p.tags.filter(t => t!== tag)}));

  const nextStep = () => { if (currentStep < totalSteps) setCurrentStep(s => s + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const handleSave = () => {
    if (!beat) return;
    onSave({
      id: beat.id,
      title: formData.title || beat.title,
      bpm: Number(formData.bpm) || beat.bpm,
      key: formData.key ? `${formData.key} Minor` : beat.key,
      genre: formData.genre || beat.genre,
    });
    onOpenChange(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <ArtworkUploadStep formData={formData} onFormDataChange={handleFormDataChange} />;
      case 2: return <BeatInfoStep formData={formData} onFormDataChange={handleFormDataChange} onAddTag={addTag} onRemoveTag={removeTag} />;
      case 3: return <CollaboratorSplitStep formData={formData} onFormDataChange={handleFormDataChange} />;
      case 4: return <ReviewStep formData={formData} onPublish={handleSave} onSaveDraft={handleSave} onSchedule={handleSave} termsAccepted={termsAccepted} onTermsChange={setTermsAccepted} />;
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
            <Button onClick={handleSave} variant={currentStep < totalSteps ? 'secondary' : 'default'}>
              {t('editBeat.saveChanges')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
