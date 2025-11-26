import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
}

interface LanguageState {
  language: 'en' | 'am' | 'om';
  setLanguage: (lang: 'en' | 'am' | 'om') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: localStorage.getItem('authToken'),
      isAuthenticated: !!localStorage.getItem('authToken'),
      login: (user, token) => {
        localStorage.setItem('authToken', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('authToken');
        set({ user: null, token: null, isAuthenticated: false });
      },
      setToken: (token) => {
        try {
          if (token) {
            localStorage.setItem('authToken', token);
            set({ token, isAuthenticated: true });
          } else {
            localStorage.removeItem('authToken');
            set({ user: null, token: null, isAuthenticated: false });
          }
        } catch (e) {
          // no-op
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'language-storage',
    }
  )
);
