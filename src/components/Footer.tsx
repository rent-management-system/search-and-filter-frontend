import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="bg-white text-foreground mt-20 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer_title')}</h3>
            <p className="text-sm opacity-90">
              {t('footer_description')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => scrollToSection('home')} className="hover:opacity-70 transition-opacity">
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('dashboard')} className="hover:opacity-70 transition-opacity">
                  {t('nav.dashboard')}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('properties')} className="hover:opacity-70 transition-opacity">
                  {t('nav.properties')}
                </button>
              </li>
              <li>
                <a href="#" className="hover:opacity-70 transition-opacity" onClick={(e) => e.preventDefault()}>
                  {t('for_landlords_link')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('resources')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => scrollToSection('contact')} className="hover:opacity-70 transition-opacity">
                  {t('contactUs')}
                </button>
              </li>
              <li>
                <a href="#" className="hover:opacity-70 transition-opacity" onClick={(e) => e.preventDefault()}>
                  {t('testimonials')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-70 transition-opacity">
                  {t('faq')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-70 transition-opacity">
                  {t('termsOfService')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('followUs')}</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm opacity-90">
          <p>&copy; {new Date().getFullYear()} {t('footer_title')}. {t('allRightsReserved')}.</p>
        </div>
      </div>
    </footer>
  );
};
