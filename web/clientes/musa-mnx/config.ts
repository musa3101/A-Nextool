/**
 * Configuración Maestra del Panel de Administración Personal de Musa (Musa MNX)
 * NexTool Control Tower — Exclusivo para Mac & iPad
 */

export type MusaAdminTab = 'apps' | 'facturas' | 'mantenimiento' | 'backends' | 'torre' | 'soporte' | 'logs' | 'facturacion';

export interface ManagedClientConfig {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  badgeColor: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  websiteUrl: string;
  appRoute: string;
  status: 'active' | 'maintenance' | 'paused';
  backend: {
    type: 'supabase';
    url: string;
    anonKey: string;
    bucket: string;
    tables: {
      carousel: string;
      moreProjects: string;
      beforeAfter: string;
      adminProfile: string;
      adminLogs: string;
      leads: string;
      contact: string;
    };
  };
  insforgeTenantId: string;
  cloudflareZoneId: string;
  launchDate: string;
  lastMaintenance: string;
  slaStatus: 'optimal' | 'attention' | 'critical';
}

export const MUSA_ADMIN_CONFIG = {
  superadmin: {
    name: 'Musa',
    handle: '@musa',
    email: 'mynextbymusa@gmail.com',
    defaultPassword: 'admin',
    role: 'Superadmin / Owner & Architect',
    platform: 'NexTool Control Tower',
    version: '1.0.0',
    avatarUrl: '/icons/astronaut.svg',
  },
  clients: [
    {
      id: 'ecuaplac',
      slug: 'ecuaplac',
      name: 'Ecuaplac Reformas',
      tagline: 'Pladur, Insonorización y Reformas en Mallorca',
      badgeColor: '#ECB51C',
      ownerName: 'José Rivadeneira',
      ownerPhone: '+34 678 15 98 78',
      ownerEmail: 'ecuaplac.jyg.sl@gmail.com',
      websiteUrl: 'https://ecuaplac.com',
      appRoute: '/ecuaplac',
      status: 'active' as const,
      backend: {
        type: 'supabase' as const,
        url: 'https://wkfddccsantywcrsxpox.supabase.co',
        anonKey: 'sb_publishable_ym3HAoFGlToeBAQu1yMd3A_m7Gx4GNI',
        bucket: 'ecuaplac-media',
        tables: {
          carousel: 'ecuaplac_galeria_1',
          moreProjects: 'ecuaplac_galeria_2',
          beforeAfter: 'ecuaplac_projects',
          adminProfile: 'ecuaplac_admin_profile',
          adminLogs: 'ecuaplac_admin_logs',
          leads: 'ecuaplac_leads',
          contact: 'ecuaplac_contact',
        },
      },
      insforgeTenantId: '1e9a3b8c-5f4d-4a1e-b8d2-c9a7e5f3b1a0',
      cloudflareZoneId: 'aec8589594db807138c90b1d09f301e1',
      launchDate: '07/06/2026',
      lastMaintenance: '12/11/2026',
      slaStatus: 'optimal' as const,
    },
  ] as ManagedClientConfig[],
};
