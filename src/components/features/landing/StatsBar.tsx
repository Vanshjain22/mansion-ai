import { Users, Home, Palette, Clock, Star } from "lucide-react";

const STATS = [
  { icon: Users, value: "10,000+", label: "Happy Users" },
  { icon: Home, value: "50,000+", label: "Rooms Designed" },
  { icon: Palette, value: "20+", label: "Premium Styles" },
  { icon: Clock, value: "30 sec", label: "Average Generation" },
  { icon: Star, value: "4.9/5", label: "User Rating" },
];

export function StatsBar() {
  return (
    <section id="stats" className="py-6 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-luxury rounded-2xl px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 justify-center"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                  <stat.icon className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text-primary font-[family-name:var(--font-manrope)]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-text-tertiary">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
