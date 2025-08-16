import { Music, Users, TrendingUp, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const stats = [
  { icon: Music, value: "50,000+", label: "beats" },
  { icon: Users, value: "5,000+", label: "producers" },
  { icon: TrendingUp, value: "₦100M+", label: "earnings" },
  { icon: Globe, value: "15", label: "countries" }
];

export function StatsSection() {
  const { t } = useLanguage();
  
  return (
    <section className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">{stat.value}</h3>
              <p className="text-muted-foreground">{t(`stats.${stat.label}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
