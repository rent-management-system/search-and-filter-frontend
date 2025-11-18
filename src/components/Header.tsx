import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSelector } from './LanguageSelector';
import { UserMenu } from './UserMenu';
import { useAuthStore } from '@/lib/store';

export const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/properties', label: t('nav.properties') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">RentAI</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSelector />
          {isAuthenticated ? (
            <UserMenu />
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
                    <UserMenu />
                  </div>
                )}
                
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isAuthenticated && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {t('nav.dashboard')}
                    </Link>
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
