import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Index from "./pages/Index";
import Dashboard from "@/pages/Dashboard";
import { useAuthStore } from '@/lib/store';
import AuthCallback from '@/pages/AuthCallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    // Parse token from URL query (?token= or ?access_token=) or hash (#access_token= or #token=)
    const { search, hash, origin, pathname } = window.location;

    const searchParams = new URLSearchParams(search);
    let token = searchParams.get('token') || searchParams.get('access_token');

    if (!token && hash) {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
      token = hashParams.get('access_token') || hashParams.get('token') || undefined;
    }

    if (token) {
      try {
        setToken(token);
        toast.success('Login successful!');
      } catch (e) {
        toast.error('Failed to store authentication token');
      } finally {
        // Clean URL to remove token
        const cleanUrl = origin + pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, [setToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <div id="bd" className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

export default App;
