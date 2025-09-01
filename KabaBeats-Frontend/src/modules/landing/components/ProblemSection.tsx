import { AlertTriangle, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const problems = [
  {
    title: "problem.paymentBarriers.title",
    description: "problem.paymentBarriers.description"
  },
  {
    title: "problem.usdPricing.title",
    description: "problem.usdPricing.description"
  },
  {
    title: "problem.noTracking.title",
    description: "problem.noTracking.description"
  },
  {
    title: "problem.complexLicensing.title",
    description: "problem.complexLicensing.description"
  }
];

const solutions = [
  "problem.solutions.0",
  "problem.solutions.1",
  "problem.solutions.2",
  "problem.solutions.3",
  "problem.solutions.4"
];

export function ProblemSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('problem.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('problem.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <div key={index} className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t(problem.title)}</h3>
                    <p className="text-muted-foreground">{t(problem.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">{t('problem.solution.title')}</h3>
            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-foreground">{t(solution)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
