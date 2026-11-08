import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ClientTenant, ModuleType, AuditEvent } from '../types';
import { INITIAL_CLIENTS, INITIAL_AUDIT_LOGS } from '../data/mockData';

interface TenantContextType {
  clients: ClientTenant[];
  auditLogs: AuditEvent[];
  activeTenant: ClientTenant | null;
  setActiveTenantId: (tenantId: string | null) => void;
  toggleTenantModule: (tenantId: string, moduleId: ModuleType, enabled: boolean) => void;
  addAuditLog: (action: string, target: string, status?: 'success' | 'warning' | 'info') => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<ClientTenant[]>(INITIAL_CLIENTS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [activeTenantId, setActiveTenantIdState] = useState<string | null>('tenant-ecuaplac');

  const activeTenant = clients.find((c) => c.id === activeTenantId) || null;

  const setActiveTenantId = (id: string | null) => {
    setActiveTenantIdState(id);
  };

  const addAuditLog = (action: string, target: string, status: 'success' | 'warning' | 'info' = 'info') => {
    const newLog: AuditEvent = {
      id: `log-${Date.now()}`,
      timestamp: 'Ahora mismo',
      user: 'Musa (Superadmin)',
      action,
      target,
      ip: '88.12.44.102 (Madrid)',
      status,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const toggleTenantModule = (tenantId: string, moduleId: ModuleType, enabled: boolean) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== tenantId) return c;
        const exists = c.modules.includes(moduleId);
        let updatedModules: ModuleType[];
        if (enabled && !exists) {
          updatedModules = [...c.modules, moduleId];
        } else if (!enabled && exists) {
          updatedModules = c.modules.filter((m) => m !== moduleId);
        } else {
          updatedModules = c.modules;
        }
        return { ...c, modules: updatedModules };
      })
    );

    const client = clients.find((c) => c.id === tenantId);
    addAuditLog(
      `Módulo ${moduleId} ${enabled ? 'activado' : 'desactivado'}`,
      client ? client.name : tenantId,
      'info'
    );
  };

  return (
    <TenantContext.Provider
      value={{
        clients,
        auditLogs,
        activeTenant,
        setActiveTenantId,
        toggleTenantModule,
        addAuditLog,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant debe usarse dentro de TenantProvider');
  return context;
};

