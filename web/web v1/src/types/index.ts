export type ModuleType =
  | 'galerias'
  | 'menus'
  | 'leads'
  | 'citas'
  | 'editor'
  | 'traduccion'
  | 'servicios';

export interface ModuleDefinition {
  id: ModuleType;
  name: string;
  description: string;
  icon: string;
  isCore?: boolean;
}

export interface ClientTenant {
  id: string;
  slug: string;
  name: string;
  sector: 'Reformas' | 'Hostelería' | 'Barbería y Estética' | 'Salud' | 'Servicios';
  websiteUrl: string;
  logoText: string;
  status: 'active' | 'pending' | 'inactive';
  modules: ModuleType[];
  contactName: string;
  contactEmail: string;
  plan: 'Boutique' | 'Pro' | 'Enterprise';
  lastActivity: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  ip: string;
  status: 'success' | 'warning' | 'info';
}

export interface GalleryPhoto {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  isCover: boolean;
  isVisible: boolean;
  sortOrder: number;
  location?: string;
  createdAt: string;
}

export interface EcuaplacWorkItem {
  id: string;
  type: 'carousel' | 'more_projects';
  title_es: string;
  title_en?: string;
  location_es?: string;
  location_en?: string;
  image_url: string;
  sort_order: number;
  active: boolean;
  fit_mode?: 'cover' | 'contain';
}

export type UserRole = 'SUPERADMIN' | 'CLIENT_USER';

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  isImpersonating?: boolean;
}

