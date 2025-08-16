import { TrendingUp, Music, Users } from "lucide-react";

export function StatsSection() {
  return (
    <section className="px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Music className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">10,000+</h3>
            <p className="text-muted-foreground">African Beats</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">2,500+</h3>
            <p className="text-muted-foreground">African Producers</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">50,000+</h3>
            <p className="text-muted-foreground">Downloads</p>
          </div>
        </div>
      </div>
    </section>
  );
}
