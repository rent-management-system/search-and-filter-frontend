import { CheckCircle2, Sparkles, Search, BookmarkCheck } from 'lucide-react';

export const Steps = () => {
  const steps = [
    {
      icon: Sparkles,
      title: 'Tell us your preferences',
      desc: 'Job/school location, salary, family size, house type and amenities.'
    },
    {
      icon: Search,
      title: 'Generate AI recommendations',
      desc: 'We match properties by proximity, transport, price and amenities.'
    },
    {
      icon: BookmarkCheck,
      title: 'Review and save favorites',
      desc: 'Open details, view on map, and leave feedback for better results.'
    }
  ];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-xs font-semibold text-muted-foreground">Step {i + 1}</div>
              </div>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Your token is used automatically for secure API calls.
        </div>
      </div>
    </section>
  );
};
