import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (lang: 'en' | 'am') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="uppercase text-xs font-medium">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('am')}>
          አማርኛ (Amharic)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
