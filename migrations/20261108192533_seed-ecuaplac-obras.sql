-- Inserción de obras de portada y más reformas para Ecuaplac
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'ecuaplac' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RETURN;
  END IF;

  -- 1. Obras de Portada (Carousel)
  INSERT INTO obras (tenant_id, type, title_es, title_en, location_es, location_en, image_url, sort_order, is_active, fit_mode)
  VALUES
    (v_tenant_id, 'carousel', 'Baño de Diseño con Bañera Exenta', 'Designer Bathroom with Freestanding Bathtub', 'Andratx, Mallorca', 'Andratx', '/ecuaplac/portfolio/IMG_2131.webp', 10, true, 'cover'),
    (v_tenant_id, 'carousel', 'Escalera Helicoidal de Yeso Pulido', 'Sculptural Helical Staircase', 'Calvià, Mallorca', 'Calvià', '/ecuaplac/portfolio/IMG_2135.webp', 20, true, 'cover'),
    (v_tenant_id, 'carousel', 'Ducha de Obra con Hornacinas Iluminadas', 'Custom Shower with Illuminated Niches', 'Sóller, Mallorca', 'Sóller', '/ecuaplac/portfolio/IMG_2134.webp', 30, true, 'cover'),
    (v_tenant_id, 'carousel', 'Cocina Moderna Integrada y Minimalista', 'Integrated Minimalist Modern Kitchen', 'Palma de Mallorca', 'Palma de Mallorca', '/ecuaplac/portfolio/IMG_2119.webp', 40, true, 'cover'),
    (v_tenant_id, 'carousel', 'Terraza Exterior y Solárium', 'Outdoor Terrace & Solarium', 'Santanyí, Mallorca', 'Santanyí', '/ecuaplac/portfolio/IMG_2129.webp', 50, true, 'cover'),
    (v_tenant_id, 'carousel', 'Aseo Minimalista de Cortesía', 'Minimalist Guest Toilet', 'Marratxí, Mallorca', 'Marratxí', '/ecuaplac/portfolio/IMG_2132.webp', 60, true, 'cover'),
    (v_tenant_id, 'carousel', 'Distribuidor con Iluminación Indirecta', 'Corridor with Indirect Lighting', 'Palma de Mallorca', 'Palma de Mallorca', '/ecuaplac/portfolio/IMG_2133.webp', 70, true, 'cover'),
    (v_tenant_id, 'carousel', 'Nicho Iluminado para Coleccionismo', 'Illuminated Display Niche', 'Palma de Mallorca', 'Palma de Mallorca', '/ecuaplac/portfolio/IMG_2136.webp', 80, true, 'cover'),
    (v_tenant_id, 'carousel', 'Detalle de Escalera Helicoidal', 'Helical Staircase Detail', 'Calvià, Mallorca', 'Calvià', '/ecuaplac/portfolio/IMG_2138.webp', 90, true, 'cover');

  -- 2. Más Proyectos (Gallery)
  INSERT INTO obras (tenant_id, type, title_es, title_en, image_url, sort_order, is_active, fit_mode)
  VALUES
    (v_tenant_id, 'gallery', 'Reforma Integral de Baño', 'Complete Bathroom Remodel', '/ecuaplac/portfolio/galeria/bano-despues-collage.webp', 10, true, 'cover'),
    (v_tenant_id, 'gallery', 'Lavabo Flotante a Medida', 'Custom Floating Sink', '/ecuaplac/portfolio/galeria/bano-piedra-espejos.webp', 20, true, 'cover'),
    (v_tenant_id, 'gallery', 'Vestidor de Pladur y Roble', 'Drywall and Oak Walk-in Closet', '/ecuaplac/portfolio/galeria/cerramiento-cristal-1.webp', 30, true, 'cover'),
    (v_tenant_id, 'gallery', 'Escalera y Distribuidor de Roble', 'Oak Staircase and Hallway', '/ecuaplac/portfolio/galeria/cerramiento-cristal-frontal.webp', 40, true, 'cover'),
    (v_tenant_id, 'gallery', 'Cerramiento panorámico — Vista frontal', 'Panoramic enclosure — Front view', '/ecuaplac/portfolio/galeria/cerramiento-cristal-frontal.webp', 50, true, 'cover'),
    (v_tenant_id, 'gallery', 'Falso techo decorativo de pladur en construcción', 'Decorative plasterboard ceiling under construction', '/ecuaplac/portfolio/galeria/techo-pladur-construccion.webp', 60, true, 'cover'),
    (v_tenant_id, 'gallery', 'Techo circular de pladur — Fase estructural', 'Circular plasterboard ceiling — Structural phase', '/ecuaplac/portfolio/galeria/techo-circular-andamios.webp', 70, true, 'cover'),
    (v_tenant_id, 'gallery', 'Techo circular de pladur — Detalle de acabado', 'Circular plasterboard ceiling — Finishing detail', '/ecuaplac/portfolio/galeria/techo-circular-detalle.webp', 80, true, 'cover'),
    (v_tenant_id, 'gallery', 'Salón con iluminación LED perimetral y vistas', 'Living room with perimeter LED lighting and views', '/ecuaplac/portfolio/galeria/salon-led-vistas.webp', 90, true, 'cover'),
    (v_tenant_id, 'gallery', 'Revestimiento de piedra natural con iluminación', 'Natural stone cladding with integrated lighting', '/ecuaplac/portfolio/galeria/piedra-natural-downlights.webp', 100, true, 'cover'),
    (v_tenant_id, 'gallery', 'Porche con ventanales — Fase de acabados', 'Porch with windows — Finishing phase', '/ecuaplac/portfolio/galeria/porche-ventanales-obra.webp', 110, true, 'cover');

END $$;
