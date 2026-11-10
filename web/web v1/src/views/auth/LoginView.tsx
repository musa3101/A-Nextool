import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SpaceLogin } from '@/components/ui/space-login';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientParam = searchParams.get('client')?.toLowerCase() || 'nextool';
  const { isAuthenticated, session, signInWithEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to proper portal
  React.useEffect(() => {
    if (isAuthenticated) {
      if (session.role === 'SUPERADMIN') {
        navigate('/admin', { replace: true });
      } else if (session.tenantId) {
        navigate('/ecuaplac', { replace: true });
      } else {
        navigate('/ecuaplac', { replace: true });
      }
    }
  }, [isAuthenticated, session, navigate]);

  const getClientInfo = () => {
    if (clientParam.includes('ecua')) {
      return {
        badge: 'ECUAPLAC REFORMAS',
        button: 'Acceder a Ecuaplac',
        defaultEmail: 'ecuaplacbyjyg@gmail.com',
      };
    }
    if (clientParam.includes('buon') || clientParam.includes('appetito')) {
      return {
        badge: 'BUON APPETITO',
        button: 'Acceder a Buon Appetito',
        defaultEmail: 'admin@buonappetito.es',
      };
    }
    return {
      badge: 'MYNEXT SUPERADMIN',
      button: 'Acceder a NexTool',
      defaultEmail: 'mynextbymusa@gmail.com',
    };
  };

  const clientInfo = getClientInfo();

  const handleLoginSubmit = async (data: { email: string; password: string; rememberMe: boolean }) => {
    setError(null);
    const res = await signInWithEmail(data.email, data.password, data.rememberMe);
    if (!res.success) {
      setError(res.error || 'Credenciales no válidas. Introduce tu Gmail y contraseña.');
      throw new Error(res.error || 'Login failed');
    }

    // Redirect based on role
    if (data.email.includes('musa') || data.email.includes('mynext')) {
      navigate('/admin');
    } else {
      navigate('/ecuaplac');
    }
  };

  return (
    <SpaceLogin
      title="Sign In"
      brandBadge={clientInfo.badge}
      buttonLabel={clientInfo.button}
      defaultEmail={clientInfo.defaultEmail}
      errorMessage={error}
      onSubmit={handleLoginSubmit}
    />
  );
};

export default LoginView;

