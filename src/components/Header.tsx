import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSelector } from './LanguageSelector';
import { UserMenu } from './UserMenu';
import { useAuthStore } from '@/lib/store';

export const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 64; // Header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: t('nav.home') },
    { id: 'properties', label: t('nav.properties') },
    { id: 'about', label: t('nav.about') },
    { id: 'contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button 
          onClick={() => scrollToSection('home')}
          className="flex items-center space-x-2"
        >
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">RentAI</span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSelector />
          {isAuthenticated ? (
            <UserMenu onDashboardClick={() => scrollToSection('dashboard')} />
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => {
                // Mock login for demo
                const mockUser = {
                  id: '1',
                  email: 'demo@rentai.et',
                  name: 'Demo User'
                };
                const mockToken = 'demo-token-' + Date.now();
                useAuthStore.getState().login(mockUser, mockToken);
              }}
            >
              Login (Demo)
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center space-x-2">
          <LanguageSelector />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex flex-col space-y-6 mt-6"
              >
                {isAuthenticated && (
                  <div className="pb-4 border-b">
                    <UserMenu onDashboardClick={() => scrollToSection('dashboard')} />
                  </div>
                )}
                
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  ))}
                  {isAuthenticated && (
                    <button
                      onClick={() => scrollToSection('dashboard')}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left"
                    >
                      {t('nav.dashboard')}
                    </button>
                  )}
                </nav>

                {!isAuthenticated && (
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => {
                      // Mock login for demo
                      const mockUser = {
                        id: '1',
                        email: 'demo@rentai.et',
                        name: 'Demo User'
                      };
                      const mockToken = 'demo-token-' + Date.now();
                      useAuthStore.getState().login(mockUser, mockToken);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login (Demo)
                  </Button>
                )}
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
