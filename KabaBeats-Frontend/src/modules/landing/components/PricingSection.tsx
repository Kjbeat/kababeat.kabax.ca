import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const plans = [
  {
    name: "free",
    price: "₦0",
    period: "/month",
    description: "pricing.free.description",
    features: [
      "pricing.free.features.0",
      "pricing.free.features.1",
      "pricing.free.features.2",
      "pricing.free.features.3",
      "pricing.free.features.4"
    ],
    popular: false
  },
  {
    name: "producer",
    price: "₦2,500",
    period: "/month",
    description: "pricing.producer.description",
    features: [
      "pricing.producer.features.0",
      "pricing.producer.features.1",
      "pricing.producer.features.2",
      "pricing.producer.features.3",
      "pricing.producer.features.4",
      "pricing.producer.features.5",
      "pricing.producer.features.6",
      "pricing.producer.features.7"
    ],
    popular: true
  },
  {
    name: "label",
    price: "₦8,000",
    period: "/month",
    description: "pricing.label.description",
    features: [
      "pricing.label.features.0",
      "pricing.label.features.1",
      "pricing.label.features.2",
      "pricing.label.features.3",
      "pricing.label.features.4",
      "pricing.label.features.5",
      "pricing.label.features.6",
      "pricing.label.features.7"
    ],
    popular: false
  }
];

export function PricingSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('pricing.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative border-border hover:shadow-hover transition-all duration-300 ${plan.popular ? 'ring-2 ring-primary shadow-glow' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  {t('pricing.mostPopular')}
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t(`pricing.${plan.name}.name`)}</CardTitle>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{t(plan.description)}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{t(feature)}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full mt-6 ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => navigate('/signup')}
                >
                  {plan.name === 'free' ? t('pricing.getStartedFree') : t('pricing.startFreeTrial')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
