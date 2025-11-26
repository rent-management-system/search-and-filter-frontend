import { CheckCircle2, Sparkles, Search, BookmarkCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Steps = () => {
  const { t } = useTranslation();
  const steps = [
    {
      icon: Sparkles,
      title: t('steps.step1_title'),
      desc: t('steps.step1_desc')
    },
    {
      icon: Search,
      title: t('steps.step2_title'),
      desc: t('steps.step2_desc')
    },
    {
      icon: BookmarkCheck,
      title: t('steps.step3_title'),
      desc: t('steps.step3_desc')
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
                <div className="text-xs font-semibold text-muted-foreground">{t('steps.step_n', { n: i + 1 })}</div>
              </div>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          {t('steps.api_token_message')}
        </div>
      </div>
    </section>
  );
};
