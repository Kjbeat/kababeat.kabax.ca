import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Brain, Share, Eye, DollarSign, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const features = [
  {
    icon: Globe,
    title: "builtForAfrica",
    description: "builtForAfrica"
  },
  {
    icon: Brain,
    title: "aiTools",
    description: "aiTools"
  },
  {
    icon: Share,
    title: "royaltySplits",
    description: "royaltySplits"
  },
  {
    icon: Eye,
    title: "usageTracker",
    description: "usageTracker"
  },
  {
    icon: DollarSign,
    title: "localPayments",
    description: "localPayments"
  },
  {
    icon: Shield,
    title: "licensing",
    description: "licensing"
  }
];

export function FeaturesSection() {
  const { t } = useLanguage();
  
  return (
    <section className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-hover transition-all duration-300 hover-scale">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{t(`features.${feature.title}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{t(`features.${feature.title}.description`)}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
