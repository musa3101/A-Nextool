import { GalleryPhoto } from '../../types';

export interface GalleryConnector {
  listCategories(tenantId: string): Promise<string[]>;
  listPhotos(tenantId: string, category?: string): Promise<GalleryPhoto[]>;
  uploadPhoto(tenantId: string, photo: Omit<GalleryPhoto, 'id' | 'createdAt'>): Promise<GalleryPhoto>;
  updatePhoto(tenantId: string, photoId: string, updates: Partial<GalleryPhoto>): Promise<GalleryPhoto>;
  deletePhoto(tenantId: string, photoId: string): Promise<boolean>;
  toggleVisibility(tenantId: string, photoId: string): Promise<boolean>;
  setCoverPhoto(tenantId: string, photoId: string, category: string): Promise<boolean>;
}

