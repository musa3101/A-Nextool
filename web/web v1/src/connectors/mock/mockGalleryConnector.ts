import { GalleryConnector } from '../types/gallery';
import { GalleryPhoto } from '../../types';
import { INITIAL_PHOTOS } from '../../data/mockData';

export class MockGalleryConnector implements GalleryConnector {
  private photos: GalleryPhoto[] = [...INITIAL_PHOTOS];

  async listCategories(tenantId: string): Promise<string[]> {
    const tenantPhotos = this.photos.filter((p) => p.tenantId === tenantId);
    const cats = new Set(tenantPhotos.map((p) => p.category));
    return Array.from(cats);
  }

  async listPhotos(tenantId: string, category?: string): Promise<GalleryPhoto[]> {
    return this.photos
      .filter((p) => p.tenantId === tenantId && (!category || category === 'Todas' || p.category === category))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async uploadPhoto(tenantId: string, photo: Omit<GalleryPhoto, 'id' | 'createdAt'>): Promise<GalleryPhoto> {
    const newPhoto: GalleryPhoto = {
      ...photo,
      id: `ph-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      sortOrder: this.photos.filter((p) => p.tenantId === tenantId).length + 1,
    };
    this.photos.unshift(newPhoto);
    return newPhoto;
  }

  async updatePhoto(tenantId: string, photoId: string, updates: Partial<GalleryPhoto>): Promise<GalleryPhoto> {
    const index = this.photos.findIndex((p) => p.id === photoId && p.tenantId === tenantId);
    if (index === -1) throw new Error('Fotografía no encontrada');
    this.photos[index] = { ...this.photos[index], ...updates };
    return this.photos[index];
  }

  async deletePhoto(tenantId: string, photoId: string): Promise<boolean> {
    this.photos = this.photos.filter((p) => !(p.id === photoId && p.tenantId === tenantId));
    return true;
  }

  async toggleVisibility(tenantId: string, photoId: string): Promise<boolean> {
    const photo = this.photos.find((p) => p.id === photoId && p.tenantId === tenantId);
    if (!photo) return false;
    photo.isVisible = !photo.isVisible;
    return true;
  }

  async setCoverPhoto(tenantId: string, photoId: string, category: string): Promise<boolean> {
    this.photos.forEach((p) => {
      if (p.tenantId === tenantId && p.category === category) {
        p.isCover = p.id === photoId;
      }
    });
    return true;
  }
}

export const mockGalleryConnector = new MockGalleryConnector();

