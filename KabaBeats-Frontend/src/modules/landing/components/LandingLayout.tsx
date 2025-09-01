import { HeroSection } from "./HeroSection";
import { StatsSection } from "./StatsSection";
import { ProblemSection } from "./ProblemSection";
import { FeaturesSection } from "./FeaturesSection";
import { PricingSection } from "./PricingSection";
import { CTASection } from "./CTASection";

export function LandingLayout() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <ProblemSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}
