import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import { useTranslation } from 'react-i18next';

const AuthCallback = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const { search, hash } = window.location;
      const searchParams = new URLSearchParams(search);
      let token = searchParams.get('token') || searchParams.get('access_token');

      if (!token && hash) {
        const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
        token = hashParams.get('access_token') || hashParams.get('token') || undefined;
      }

      if (token) {
        setToken(token);
        toast.success(t('auth.signed_in'));
      } else {
        toast.error(t('auth.no_token'));
      }
    } catch (e) {
      toast.error(t('auth.callback_failed'));
    } finally {
      navigate('/', { replace: true });
    }
  }, [navigate, setToken, t]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold">{t('auth.completing_sign_in')}</p>
        <p className="text-sm text-muted-foreground">{t('auth.please_wait')}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
