import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserSession, UserRole } from '../types';

interface AuthContextType {
  session: UserSession;
  loginAsSuperadmin: () => void;
  loginAsClient: (tenantId: string, clientName: string) => void;
  startImpersonation: (tenantId: string, clientName: string) => void;
  stopImpersonation: () => void;
}

const DEFAULT_SUPERADMIN: UserSession = {
  userId: 'usr_musa_admin',
  name: 'Musa',
  email: 'musa@mynext.es',
  role: 'SUPERADMIN',
  tenantId: null,
  isImpersonating: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(DEFAULT_SUPERADMIN);

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
      email: 'musa@mynext.es',
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

