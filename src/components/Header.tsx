import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

export const Header: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleNav = () => setIsNavOpen((s) => !s);
  const closeNav = () => setIsNavOpen(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('access_token');
      console.log('🔒 Cleared auth tokens from storage');
    } catch (e) {
      console.warn('Failed to clear tokens during logout', e);
    }

    window.location.href = 'https://rental-user-management-frontend-sigma.vercel.app/';
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    setIsNavOpen(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsNavOpen(false);
    }
  };

  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNavOpen]);

  return (
    <div className="flex items-center justify-between pt-4 px-3 relative z-20">
      <div>
        <img src="/Black.png" alt="Logo" className="h-20" />
      </div>

      <nav className="items-center space-x-12 list-none hidden md:flex">
        <button
          onClick={() => scrollToSection('home')}
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-primary cursor-pointer"
        >
          {t('nav.home')}
        </button>
        <button
          onClick={() => scrollToSection('about')}
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-primary cursor-pointer"
        >
          {t('nav.about')}
        </button>
        <button
          onClick={() => scrollToSection('properties')}
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-primary cursor-pointer"
        >
          {t('nav.properties')}
        </button>
        <button
          onClick={() => scrollToSection('contact')}
          className="text-md mr-2 text-[18px] transition-transform duration-200 hover:scale-105 hover:text-primary cursor-pointer"
        >
          {t('nav.contact')}
        </button>
      </nav>

      <div className="flex items-center">
        <div className="nav-child3 -mr-4 hidden md:flex items-center space-x-3">
          <select
            className="language-selector-desktop bg-transparent border p-1 rounded"
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
          >
            <option value="" disabled>
              {t('select_language')}
            </option>
            <option value="am">{t('amharic_option')}</option>
            <option value="en">{t('english_option')}</option>
            <option value="om">{t('afan_oromo_option')}</option>
          </select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-100 transition-all duration-300">
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="text-primary transition-transform duration-300 group-hover:rotate-180"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-56 p-2 rounded-xl shadow-xl border border-gray-200"
            >
              <DropdownMenuItem 
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={handleDashboard}
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Dashboard</span>
                  <span className="text-xs text-gray-500">Manage your account</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem 
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-destructive/10 transition-colors group"
                onClick={handleLogout}
              >
                <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <LogOut className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 group-hover:text-destructive transition-colors">
                    Logout
                  </span>
                  <span className="text-xs text-gray-500">Sign out of your account</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="md:hidden ml-2">
          <div
            className={`hamburger-icon ${isNavOpen && 'gap'}`}
            onClick={toggleNav}
            style={{
              paddingRight: '2px',
              transform: 'scale(0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '4px',
              position: 'absolute',
              height: '44px',
              width: '60px',
              top: '1.4rem',
              right: '1rem',
              zIndex: 1000,
              cursor: 'pointer',
              borderRadius: '5px',
              transition: 'all 0.2s ease-in-out',
              background: 'rgb(255 255 255 / 43%)',
              boxShadow: isNavOpen ? '0px 0px 30px rgba(0, 0, 0, 0.1)' : 'none',
              color: 'hsl(var(--primary))'
            }}
          >
            <div 
              className={`icon-1 ${isNavOpen && 'a'}`}
              style={{
                width: isNavOpen ? '37px' : '32px',
                height: '3px',
                backgroundColor: 'currentColor',
                transition: 'all 400ms ease',
                transform: isNavOpen ? 'rotate(40deg)' : 'none',
                position: 'relative',
                top: isNavOpen ? '3px' : '0'
              }}
            />
            <div 
              className={`icon-2 ${isNavOpen && 'c'}`}
              style={{
                width: '32px',
                height: '3px',
                backgroundColor: 'currentColor',
                transition: 'all 400ms ease',
                opacity: isNavOpen ? '0' : '1'
              }}
            />
            <div 
              className={`icon-3 ${isNavOpen && 'b'}`}
              style={{
                width: isNavOpen ? '37px' : '32px',
                height: '3px',
                backgroundColor: 'currentColor',
                transition: 'all 400ms ease',
                transform: isNavOpen ? 'rotate(-40deg)' : 'none',
                position: 'relative',
                bottom: isNavOpen ? '2px' : '0'
              }}
            />
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
          isNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } z-[9998]`}
        onClick={closeNav}
        aria-hidden={!isNavOpen}
      />

      <div 
        id="nav" 
        className={`fixed top-0 right-0 h-screen bg-[#222a2f] text-white z-[9999] transition-all duration-600 ease-spring-bounce delay-100 ${
          isNavOpen ? 'w-[53%] opacity-100' : 'w-0 opacity-0'
        }`}
        aria-hidden={!isNavOpen}
      >
        <ul className="ul" style={{ margin: 0, position: 'absolute', top: '30%', left: '7vw', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li className="li li1" style={{ listStyle: 'none', fontSize: '24px', color: '#fff', lineHeight: '2.2', textTransform: 'uppercase', letterSpacing: '1.7px', cursor: 'pointer' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
              style={{ textDecoration: 'none', color: '#d8ccccfc', whiteSpace: 'normal', overflowWrap: 'break-word' }}
            >
              {t('nav.home')}
            </a>
          </li>
          <li className="li li2" style={{ listStyle: 'none', fontSize: '24px', color: '#fff', lineHeight: '2.2', textTransform: 'uppercase', letterSpacing: '1.7px', cursor: 'pointer' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
              style={{ textDecoration: 'none', color: '#d8ccccfc', whiteSpace: 'normal', overflowWrap: 'break-word' }}
            >
              {t('nav.about')}
            </a>
          </li>
          <li className="li li3" style={{ listStyle: 'none', fontSize: '24px', color: '#fff', lineHeight: '2.2', textTransform: 'uppercase', letterSpacing: '1.7px', cursor: 'pointer' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); scrollToSection('properties'); }}
              style={{ textDecoration: 'none', color: '#d8ccccfc', whiteSpace: 'normal', overflowWrap: 'break-word' }}
            >
              {t('nav.properties')}
            </a>
          </li>
          {/* No testimonials section in Index; skipping */}
          <li className="li li5" style={{ listStyle: 'none', fontSize: '24px', color: '#fff', lineHeight: '2.2', textTransform: 'uppercase', letterSpacing: '1.7px', cursor: 'pointer' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
              style={{ textDecoration: 'none', color: '#d8ccccfc', whiteSpace: 'normal', overflowWrap: 'break-word' }}
            >
              {t('nav.contact')}
            </a>
          </li>
          <li className="li">
            <select
              className="sign"
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              style={{
                display: 'flex',
                padding: '0 2rem',
                backgroundColor: 'transparent',
                borderRadius: '0.3rem',
                alignItems: 'center',
                color: '#d8ccccfc',
                fontSize: '1.3rem',
                marginTop: '1rem',
                transition: 'all 0.3s',
                borderRight: '3px solid',
                borderTop: '1px solid',
                borderBottom: '3px solid',
                borderLeft: '1px solid'
              }}
            >
              <option value="" disabled>
                {t('select_language')}
              </option>
              <option value="am">{t('amharic_option')}</option>
              <option value="en">{t('english_option')}</option>
              <option value="om">{t('afan_oromo_option')}</option>
            </select>
          </li>
        </ul>
      </div>
    </div>
  );
};
