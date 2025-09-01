import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProgressStepProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function ProgressStep({ currentStep, totalSteps, stepLabels }: ProgressStepProps) {
  const { t } = useLanguage();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{t('upload.progress.stepOf').replace('{current}', currentStep.toString()).replace('{total}', totalSteps.toString())}</span>
          <span className="text-sm text-muted-foreground">{t('upload.progress.complete').replace('{progress}', Math.round(progress).toString())}</span>
        </div>
        <Progress value={progress} className="mb-4" />
        <div className="grid gap-2 text-xs" style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}>
          {stepLabels.map((label, index) => (
            <div 
              key={label}
              className={currentStep >= index + 1 ? "text-primary font-medium" : "text-muted-foreground"}
            >
              {label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
