export interface EcuaplacClientConfig {
  slug: string;
  name: string;
  tagline: string;
  owner: string;
  role: string;
  websiteUrl: string;
  brandColor: string;
  version: string;
  backend: {
    type: 'supabase';
    url: string;
    anonKey: string;
    bucket: string;
    tables: {
      carousel: string;
      projects: string;
      adminProfile: string;
      adminLogs: string;
      leads: string;
    };
  };
  cloudflare?: {
    zoneId: string;
  };
}

export const ECUAPLAC_CONFIG: EcuaplacClientConfig = {
  slug: 'ecuaplac',
  name: 'Ecuaplac',
  tagline: 'Reformas Integrales de Alta Gama',
  owner: 'José Rivadeneira',
  role: 'Administrador / Gerente',
  websiteUrl: 'https://ecuaplac.com',
  brandColor: '#ECB51C', // Oro distintivo de Ecuaplac
  version: '2.0.0',
  backend: {
    type: 'supabase',
    url: 'https://wkfddccsantywcrsxpox.supabase.co',
    anonKey: 'sb_publishable_ym3HAoFGlToeBAQu1yMd3A_m7Gx4GNI',
    bucket: 'ecuaplac-media',
    tables: {
      carousel: 'ecuaplac_carousel',
      projects: 'ecuaplac_projects',
      adminProfile: 'ecuaplac_admin_profile',
      adminLogs: 'ecuaplac_admin_logs',
      leads: 'ecuaplac_leads',
    },
  },
  cloudflare: {
    zoneId: 'aec8589594db807138c90b1d09f301e1',
  },
};
