import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

export type AuthUser = {
  name: string;
  email: string;
  avatarInitials: string;
};

type StoredSession = {
  user: AuthUser;
  token: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AUTH_SESSION_KEY = 'auth-session';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    (async () => {
      // expo-secure-store no soporta web (SDK 57): en esa plataforma no se
      // restaura ni persiste sesión, cada carga vuelve a pedir login.
      if (Platform.OS !== 'web') {
        const raw = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
        if (raw) {
          const { user } = JSON.parse(raw) as StoredSession;
          setUser(user);
          setIsAuthenticated(true);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    if (!EMAIL_REGEX.test(email)) return { success: false, error: 'Ingresa un email válido.' };
    if (password.length === 0) return { success: false, error: 'Ingresa tu contraseña.' };

    const namePart = email.split('@')[0].replace(/[._]/g, ' ');
    const name = namePart.replace(/\b\w/g, (c) => c.toUpperCase());
    const avatarInitials = name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    const nextUser: AuthUser = { name, email, avatarInitials };
    const token = `mock-token-${Date.now()}`;

    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify({ user: nextUser, token }));
    }
    setUser(nextUser);
    setIsAuthenticated(true);
    return { success: true };
  }

  async function logout() {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
    }
    setUser(null);
    setIsAuthenticated(false);
  }

  const value: AuthContextValue = { isAuthenticated, isLoading, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
