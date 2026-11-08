import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, UserRole } from '../types';
import { insforge } from '../lib/insforge';

interface AuthContextType {
  session: UserSession;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  loginAsSuperadmin: () => void;
  loginAsClient: (tenantId: string, clientName: string) => void;
  startImpersonation: (tenantId: string, clientName: string) => void;
  stopImpersonation: () => void;
}

const LOCAL_STORAGE_SESSION_KEY = 'nextool_auth_session';

const GUEST_SESSION: UserSession = {
  userId: '',
  name: 'Invitado',
  email: '',
  role: 'CLIENT_USER',
  tenantId: null,
  isImpersonating: false,
};

const DEFAULT_SUPERADMIN: UserSession = {
  userId: 'usr_musa_admin',
  name: 'Musa (MYNEXT)',
  email: 'musaabdul3101@gmail.com',
  role: 'SUPERADMIN',
  tenantId: null,
  isImpersonating: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.userId && parsed?.email) return parsed;
      }
    } catch {
      // Ignorar fallos de lectura
    }
    // Estado inicial de invitado (requiere login con Gmail + contraseña)
    return GUEST_SESSION;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isAuthenticated = Boolean(session.userId && session.email);

  // Sincronizar estado con localStorage
  useEffect(() => {
    if (session.userId && session.email) {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    }
  }, [session]);

  const signInWithEmail = async (
    email: string,
    password: string,
    remember = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Intentar inicio de sesión en InsForge Auth
      let authRes = await insforge.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      // Si no existe el usuario (primer acceso del gestor), lo registramos automáticamente
      if (authRes.error) {
        const signUpRes = await insforge.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (!signUpRes.error) {
          authRes = await insforge.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
        }
      }

      // 2. Comprobar permisos en la tabla tenant_users
      const { data: memberData } = await insforge.database
        .from('tenant_users')
        .select('*')
        .eq('email', cleanEmail)
        .limit(1);

      const member = memberData && memberData.length > 0 ? memberData[0] : null;

      // Si es Musa (Superadmin)
      if (
        cleanEmail === 'musaabdul3101@gmail.com' ||
        cleanEmail === 'mynextbymusa@gmail.com' ||
        member?.role === 'superadmin'
      ) {
        const newSession: UserSession = {
          userId: authRes.data?.user?.id || 'usr_musa_admin',
          name: member?.display_name || 'Musa (Superadmin)',
          email: cleanEmail,
          role: 'SUPERADMIN',
          tenantId: null,
          isImpersonating: false,
        };
        setSession(newSession);
        if (remember) localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newSession));
        return { success: true };
      }

      // Si es un dueño de negocio (ej. José de Ecuaplac)
      const newSession: UserSession = {
        userId: authRes.data?.user?.id || member?.id || `usr_${cleanEmail.split('@')[0]}`,
        name: member?.display_name || 'Gestor de Negocio',
        email: cleanEmail,
        role: 'CLIENT_USER',
        tenantId: member?.tenant_id || '0bc42bdf-6929-4c06-8667-1fd646288513',
        isImpersonating: false,
      };

      setSession(newSession);
      if (remember) localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newSession));
      return { success: true };
    } catch (err: any) {
      console.error('Error en autenticación InsForge:', err);
      return { success: false, error: err.message || 'Error al autenticar' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await insforge.auth.signOut();
    } catch {
      // Ignorar fallo de red en logout
    }
    setSession(GUEST_SESSION);
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
  };

  const loginAsSuperadmin = () => {
    setSession(DEFAULT_SUPERADMIN);
  };

  const loginAsClient = (tenantId: string, clientName: string) => {
    setSession({
      userId: `usr_${tenantId}`,
      name: clientName,
      email: `admin@${tenantId}.es`,
      role: 'CLIENT_USER',
      tenantId,
      isImpersonating: false,
    });
  };

  const startImpersonation = (tenantId: string, clientName: string) => {
    setSession({
      userId: 'usr_musa_admin',
      name: `Musa (Viendo como ${clientName})`,
      email: 'musaabdul3101@gmail.com',
      role: 'SUPERADMIN',
      tenantId,
      isImpersonating: true,
    });
  };

  const stopImpersonation = () => {
    setSession(DEFAULT_SUPERADMIN);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated,
        isLoading,
        signInWithEmail,
        signOut,
        loginAsSuperadmin,
        loginAsClient,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
