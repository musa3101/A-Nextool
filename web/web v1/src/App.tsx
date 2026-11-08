import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { AppLayout } from './components/layout/AppLayout';

// Admin Views
import { AdminDashboard } from './views/admin/AdminDashboard';
import { ClientList } from './views/admin/ClientList';
import { ModulesCatalog } from './views/admin/ModulesCatalog';
import { AuditLogs } from './views/admin/AuditLogs';
import { GlobalSettings } from './views/admin/GlobalSettings';

// Client Views
import { ClientDashboard } from './views/client/ClientDashboard';
import { EcuaplacPortal } from './views/client/EcuaplacPortal';
import { GalleryManager } from './views/client/GalleryManager';
import { MenusManager } from './views/client/MenusManager';
import { LeadsManager } from './views/client/LeadsManager';
import { AccountSettings } from './views/client/AccountSettings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TenantProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              {/* Default Redirect to Ecuaplac */}
              <Route index element={<Navigate to="/ecuaplac" replace />} />

              {/* Direct Client Access URLs */}
              <Route path="ecuaplac" element={<EcuaplacPortal />} />
              <Route path="buon-appetito" element={<Navigate to="/app/buon-appetito" replace />} />

              {/* MYNEXT ADMIN Routes */}
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/clientes" element={<ClientList />} />
              <Route path="admin/modulos" element={<ModulesCatalog />} />
              <Route path="admin/auditoria" element={<AuditLogs />} />
              <Route path="admin/ajustes" element={<GlobalSettings />} />

              {/* CLIENT PANEL Dynamic Routes */}
              <Route path="app/:clientSlug" element={<ClientDashboard />} />
              <Route path="app/ecuaplac/galerias" element={<EcuaplacPortal />} />
              <Route path="app/:clientSlug/galerias" element={<GalleryManager />} />
              <Route path="app/:clientSlug/menus" element={<MenusManager />} />
              <Route path="app/:clientSlug/leads" element={<LeadsManager />} />
              <Route path="app/:clientSlug/ajustes" element={<AccountSettings />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;

