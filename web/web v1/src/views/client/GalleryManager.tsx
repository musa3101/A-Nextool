import React, { useState, useEffect } from 'react';
import {
  Upload,
  Eye,
  EyeOff,
  Star,
  Trash2,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  HardDrive,
  Images,
  Plus,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { mockGalleryConnector } from '../../connectors/mock/mockGalleryConnector';
import { GalleryPhoto } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Switch } from '../../components/ui/Switch';

export const GalleryManager: React.FC = () => {
  const { activeTenant, addAuditLog } = useTenant();

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // New photo form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Cocinas Modernas');
  const [newLocation, setNewLocation] = useState('Madrid');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newIsCover, setNewIsCover] = useState(false);
  const [newIsVisible, setNewIsVisible] = useState(true);

  const tenantId = activeTenant?.id || 'tenant-ecuaplac';

  const loadData = async () => {
    const cats = await mockGalleryConnector.listCategories(tenantId);
    setCategories(['Todas', ...cats]);
    const list = await mockGalleryConnector.listPhotos(tenantId, selectedCategory);
    setPhotos(list);
  };

  useEffect(() => {
    loadData();
  }, [tenantId, selectedCategory]);

  const handleToggleVisibility = async (photo: GalleryPhoto) => {
    await mockGalleryConnector.toggleVisibility(tenantId, photo.id);
    addAuditLog(
      `Foto «${photo.title.substring(0, 25)}...» ${photo.isVisible ? 'ocultada' : 'publicada'}`,
      activeTenant?.name || 'Galería',
      'info'
    );
    loadData();
  };

  const handleSetCover = async (photo: GalleryPhoto) => {
    await mockGalleryConnector.setCoverPhoto(tenantId, photo.id, photo.category);
    addAuditLog(
      `Foto marcada como Portada en ${photo.category}`,
      activeTenant?.name || 'Galería',
      'success'
    );
    loadData();
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    if (window.confirm(`¿Seguro que deseas eliminar la foto "${photo.title}"?`)) {
      await mockGalleryConnector.deletePhoto(tenantId, photo.id);
      addAuditLog(
        `Foto eliminada de ${photo.category}`,
        activeTenant?.name || 'Galería',
        'warning'
      );
      loadData();
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Por favor indica un título para la fotografía.');
      return;
    }

    const imageFallback =
      newImageUrl.trim() ||
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

    await mockGalleryConnector.uploadPhoto(tenantId, {
      tenantId,
      title: newTitle,
      category: newCategory,
      location: newLocation,
      description: newDescription,
      imageUrl: imageFallback,
      isCover: newIsCover,
      isVisible: newIsVisible,
      sortOrder: photos.length + 1,
    });

    addAuditLog(
      `Nueva fotografía añadida: «${newTitle.substring(0, 25)}...»`,
      activeTenant?.name || 'Galería',
      'success'
    );

    setIsUploadOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl('');
    setNewIsCover(false);
    loadData();
  };

  // Filtered photos
  const filteredPhotos = photos.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVisibility =
      visibilityFilter === 'all'
        ? true
        : visibilityFilter === 'visible'
        ? p.isVisible
        : !p.isVisible;

    return matchesSearch && matchesVisibility;
  });

  const totalVisible = photos.filter((p) => p.isVisible).length;
  const totalHidden = photos.filter((p) => !p.isVisible).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header con Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="champagne">Módulo Oficial</Badge>
            <span className="text-xs text-slate-500 font-medium">Gestión de Proyectos Web</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">
            Galería de Fotos y Proyectos
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Organiza las imágenes que se muestran en el portfolio de tu página web oficial.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4 text-champagne-400" />}
          onClick={() => setIsUploadOpen(true)}
          className="self-start sm:self-auto shadow-atelier"
        >
          Subir Nueva Fotografía
        </Button>
      </div>

      {/* 2. Barra de Estadísticas y Almacenamiento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-card border border-surface-border shadow-atelier-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Fotografías
          </span>
          <span className="text-2xl font-extrabold text-navy-900 mt-1 block">
            {photos.length}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-card border border-surface-border shadow-atelier-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Publicadas en Web
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
            {totalVisible}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-card border border-surface-border shadow-atelier-sm">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Ocultas / Borrador
          </span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
            {totalHidden}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-card border border-surface-border shadow-atelier-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Almacenamiento Edge</span>
          </span>
          <span className="text-2xl font-extrabold text-navy-900 mt-1 block">
            18.4 MB <span className="text-xs text-slate-400 font-normal">/ 10 GB</span>
          </span>
        </div>
      </div>

      {/* 3. Pestañas de Categorías (De Stitch) */}
      <div className="border-b border-surface-border">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
                selectedCategory === cat
                  ? 'border-navy-900 text-navy-900 bg-white/80'
                  : 'border-transparent text-slate-500 hover:text-navy-900 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Barra de Filtros Secundarios y Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-card border border-surface-border shadow-atelier-sm">
        {/* Chips de Visibilidad */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setVisibilityFilter('all')}
            className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all ${
              visibilityFilter === 'all'
                ? 'bg-navy-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas ({photos.length})
          </button>
          <button
            onClick={() => setVisibilityFilter('visible')}
            className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all ${
              visibilityFilter === 'visible'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Publicadas ({totalVisible})
          </button>
          <button
            onClick={() => setVisibilityFilter('hidden')}
            className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all ${
              visibilityFilter === 'hidden'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ocultas ({totalHidden})
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-canvas border border-surface-border text-xs rounded-pill pl-9 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-champagne-500/40"
          />
        </div>
      </div>

      {/* 5. Cuadrícula de Fotografías */}
      {filteredPhotos.length === 0 ? (
        /* Empty State */
        <Card elevation="rest" className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Images className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-navy-900">No hay fotografías con este filtro</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Añade nuevas obras o cambia la categoría seleccionada para ver proyectos.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4 text-champagne-400" />}
            onClick={() => setIsUploadOpen(true)}
          >
            Subir Fotografía
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPhotos.map((photo) => (
            <Card
              key={photo.id}
              elevation="hover"
              className="p-0 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image Container with Badges */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    {photo.isCover ? (
                      <Badge variant="champagne" className="shadow-sm font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Foto Portada</span>
                      </Badge>
                    ) : (
                      <span />
                    )}

                    <Badge
                      variant={photo.isVisible ? 'success' : 'warning'}
                      className="shadow-sm"
                    >
                      {photo.isVisible ? 'Publicada' : 'Oculta'}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-bold text-champagne-500 uppercase tracking-wider block">
                    {photo.category}
                  </span>
                  <h3 className="font-bold text-sm text-navy-900 line-clamp-2 leading-snug">
                    {photo.title}
                  </h3>
                  {photo.location && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{photo.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-3 bg-surface-canvas border-t border-surface-border flex items-center justify-between text-xs">
                <button
                  onClick={() => handleSetCover(photo)}
                  className={`flex items-center gap-1 font-semibold transition-colors ${
                    photo.isCover
                      ? 'text-amber-600'
                      : 'text-slate-500 hover:text-navy-900'
                  }`}
                  title={photo.isCover ? 'Es la portada actual' : 'Hacer portada de categoría'}
                >
                  <Star className={`w-3.5 h-3.5 ${photo.isCover ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span className="text-[11px]">{photo.isCover ? 'Portada' : 'Hacer Portada'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleVisibility(photo)}
                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                    title={photo.isVisible ? 'Ocultar de la web' : 'Publicar en la web'}
                  >
                    {photo.isVisible ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-amber-600" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(photo)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Eliminar fotografía"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 6. Modal de Subida de Fotografía (De Stitch) */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Subir Nueva Fotografía de Proyecto"
        subtitle="Sube una imagen de alta resolución que se sincronizará automáticamente con tu web."
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              form="upload-photo-form"
              icon={<Upload className="w-4 h-4 text-champagne-400" />}
            >
              Guardar y Publicar
            </Button>
          </>
        }
      >
        <form id="upload-photo-form" onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          {/* Drag & Drop Simulation Zone */}
          <div className="border-2 border-dashed border-slate-300 rounded-card p-6 text-center hover:border-navy-900 transition-colors bg-surface-canvas/50 cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <span className="font-bold text-navy-900 block text-sm">
              Arrastra aquí tu fotografía o haz click para explorar
            </span>
            <span className="text-slate-500 text-[11px] block mt-1">
              Compatible con JPG, PNG y WebP. Optimización automática en el Edge.
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              URL de imagen de demostración (o pega una URL)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-full border border-surface-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-champagne-500/40 focus:border-navy-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Título del Proyecto / Reforma *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Cocina Abierta con Isla en Majadahonda"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-surface-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-champagne-500/40 focus:border-navy-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Categoría</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-surface-border rounded-lg px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-champagne-500/40"
              >
                <option value="Cocinas Modernas">Cocinas Modernas</option>
                <option value="Baños y Cerámica">Baños y Cerámica</option>
                <option value="Reformas Integrales">Reformas Integrales</option>
                <option value="Exteriores">Exteriores</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Ubicación / Ciudad</label>
              <input
                type="text"
                placeholder="Ej: Pozuelo de Alarcón, Madrid"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full border border-surface-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-champagne-500/40"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Descripción del Trabajo Realizado
            </label>
            <textarea
              rows={3}
              placeholder="Describe los acabados, materiales y detalles destacados de la obra..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full border border-surface-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-champagne-500/40"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <Switch
              checked={newIsVisible}
              onChange={setNewIsVisible}
              label="Publicar inmediatamente"
              description="La foto será visible al instante en la web del cliente"
            />

            <Switch
              checked={newIsCover}
              onChange={setNewIsCover}
              label="Marcar como Foto de Portada"
              description="Aparecerá como tarjeta principal en la cabecera de la categoría"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

