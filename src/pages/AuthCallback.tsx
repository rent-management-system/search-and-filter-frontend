import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';

const AuthCallback = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

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
        toast.success('You are now signed in!');
      } else {
        toast.error('No token found in callback URL');
      }
    } catch (e) {
      toast.error('Failed to process login callback');
    } finally {
      navigate('/', { replace: true });
    }
  }, [navigate, setToken]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold">Completing sign-in…</p>
        <p className="text-sm text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
