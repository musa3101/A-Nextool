/**
 * Motor de Traducción Profesional para Ecuaplac (ES -> EN & DE)
 * Triple motor en cascada:
 * 1. Diccionario exacto de arquitectura y reformas (instantáneo para términos clave)
 * 2. Doble API Online (Google Translate GTX + MyMemory CORS API para Safari/iOS)
 * 3. Traductor composicional inteligente con soporte Unicode completo (+220 términos)
 */

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s*\/\s*$/, '')
    .trim();
}

function capitalizeFirstLetter(str: string): string {
  const cleaned = str.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Palabras internacionales que son válidas aunque coincidan en ambos idiomas
const INTERNATIONAL_WORDS = new Set([
  'villa',
  'penthouse',
  'loft',
  'hotel',
  'spa',
  'led',
  'mallorca',
  'palma',
  'andratx',
  'calvià',
  'calvia',
  'sóller',
  'soller',
  'santanyí',
  'santanyi',
  'son vida',
  'alcúdia',
  'alcudia',
  'pollença',
  'pollensa',
  'manacor',
  'inca',
  'ibiza',
  'suite',
  'bungalow',
  'duplex',
  'dúplex',
  'studio',
]);

// Diccionario completo de respaldo y precisión arquitectónica (ES -> EN)
const BACKUP_DICT_EN: Record<string, string> = {
  // Frases compuestas prioritarias
  'reforma integral de vivienda': 'Complete Home Renovation',
  'reforma integral de casa': 'Complete House Renovation',
  'reforma integral de baño': 'Complete Bathroom Renovation',
  'reforma integral de cocina': 'Complete Kitchen Renovation',
  'reforma integral de piso': 'Complete Apartment Renovation',
  'reforma integral de chalet': 'Complete Villa Renovation',
  'reforma integral de local': 'Complete Commercial Renovation',
  'reforma integral de oficina': 'Complete Office Renovation',
  'reforma de casa': 'House Renovation',
  'reforma de vivienda': 'Home Renovation',
  'reforma de piso': 'Apartment Renovation',
  'reforma de baño': 'Bathroom Renovation',
  'reforma de cocina': 'Kitchen Renovation',
  'reforma de salón': 'Living Room Renovation',
  'reforma de salon': 'Living Room Renovation',
  'reforma de habitación': 'Bedroom Renovation',
  'reforma de habitacion': 'Bedroom Renovation',
  'reforma de dormitorio': 'Bedroom Renovation',
  'reforma de terraza': 'Terrace Renovation',
  'reforma de fachada': 'Facade Renovation',
  'reforma de local': 'Commercial Space Renovation',
  'reforma de oficina': 'Office Renovation',
  'reforma integral': 'Complete Renovation',
  'reformas integrales': 'Comprehensive Renovations',
  'techo falso': 'False Ceiling',
  'falso techo': 'False Ceiling',
  'techos falsos': 'Suspended Ceilings',
  'falsos techos': 'Suspended Ceilings',
  'techo continuo': 'Seamless Ceiling',
  'techo registrable': 'Modular Drop Ceiling',
  'techo acústico': 'Acoustic Ceiling',
  'techo acustico': 'Acoustic Ceiling',
  'techo de pladur': 'Drywall Ceiling',
  'tabique de pladur': 'Drywall Partition',
  'tabiques de pladur': 'Drywall Partitions',
  'pared de pladur': 'Drywall Wall',
  'mueble de pladur': 'Custom Drywall Unit',
  'estantería de pladur': 'Custom Drywall Shelving',
  'estanteria de pladur': 'Custom Drywall Shelving',
  'bañera exenta': 'Freestanding Bathtub',
  'banera exenta': 'Freestanding Bathtub',
  'plato de ducha': 'Walk-in Shower Tray',
  'aislamiento acústico': 'Acoustic Insulation',
  'aislamiento acustico': 'Acoustic Insulation',
  'aislamiento térmico': 'Thermal Insulation',
  'aislamiento termico': 'Thermal Insulation',
  'tabiquería seca': 'Drywall Partitioning',
  'tabiqueria seca': 'Drywall Partitioning',
  'foseado led': 'LED Cove Lighting',
  'iluminación led': 'LED Lighting',
  'iluminacion led': 'LED Lighting',
  'iluminación indirecta': 'Indirect Lighting',
  'iluminacion indirecta': 'Indirect Lighting',
  'luz indirecta': 'Indirect Lighting',
  'luz oculta': 'Hidden Cove Lighting',
  'dormitorio principal': 'Master Bedroom',
  'habitación principal': 'Master Bedroom',
  'habitacion principal': 'Master Bedroom',
  'vivienda unifamiliar': 'Detached Family Home',
  'casa unifamiliar': 'Detached House',
  'casa moderna': 'Modern House',
  'casa rústica': 'Rustic House',
  'casa rustica': 'Rustic House',
  'casa de lujo': 'Luxury House',
  'casa de campo': 'Country House',
  'villa de lujo': 'Luxury Villa',
  'obra nueva': 'New Build Project',
  'alta gama': 'High-End',
  'llave en mano': 'Turnkey Project',

  // Términos individuales de vivienda y estancias
  'casa': 'House',
  'casas': 'Houses',
  'vivienda': 'Home',
  'viviendas': 'Homes',
  'hogar': 'Home',
  'piso': 'Apartment',
  'pisos': 'Apartments',
  'apartamento': 'Apartment',
  'apartamentos': 'Apartments',
  'chalet': 'Luxury Villa',
  'chalets': 'Luxury Villas',
  'finca': 'Country Estate',
  'ático': 'Penthouse',
  'atico': 'Penthouse',
  'dúplex': 'Duplex',
  'duplex': 'Duplex',
  'estudio': 'Studio',
  'local': 'Commercial Space',
  'locales': 'Commercial Spaces',
  'oficina': 'Office',
  'oficinas': 'Offices',
  'tienda': 'Retail Store',
  'restaurante': 'Restaurant',
  'hotel': 'Hotel',
  'edificio': 'Building',
  'garaje': 'Garage',
  'sótano': 'Basement',
  'sotano': 'Basement',
  'buhardilla': 'Attic',
  'salón': 'Living Room',
  'salon': 'Living Room',
  'comedor': 'Dining Room',
  'cocina': 'Kitchen',
  'cocinas': 'Kitchens',
  'baño': 'Bathroom',
  'bano': 'Bathroom',
  'baños': 'Bathrooms',
  'banos': 'Bathrooms',
  'aseo': 'Guest Bathroom',
  'ducha': 'Shower',
  'bañera': 'Bathtub',
  'banera': 'Bathtub',
  'dormitorio': 'Bedroom',
  'dormitorios': 'Bedrooms',
  'habitación': 'Bedroom',
  'habitacion': 'Bedroom',
  'habitaciones': 'Bedrooms',
  'vestidor': 'Walk-in Closet',
  'armario': 'Wardrobe',
  'armarios': 'Wardrobes',
  'pasillo': 'Hallway',
  'recibidor': 'Entrance Hall',
  'entrada': 'Entrance',
  'terraza': 'Terrace',
  'terrazas': 'Terraces',
  'balcón': 'Balcony',
  'balcon': 'Balcony',
  'jardín': 'Garden',
  'jardin': 'Garden',
  'piscina': 'Swimming Pool',
  'porche': 'Porch',
  'fachada': 'Facade',
  'fachadas': 'Facades',
  'escalera': 'Staircase',
  'escaleras': 'Staircases',

  // Materiales y elementos constructivos
  'pladur': 'Drywall',
  'insonorización': 'Soundproofing',
  'insonorizacion': 'Soundproofing',
  'aislamiento': 'Insulation',
  'acústico': 'Acoustic',
  'acustico': 'Acoustic',
  'acústica': 'Acoustic',
  'acustica': 'Acoustic',
  'térmico': 'Thermal',
  'termico': 'Thermal',
  'térmica': 'Thermal',
  'termica': 'Thermal',
  'techo': 'Ceiling',
  'techos': 'Ceilings',
  'pared': 'Wall',
  'paredes': 'Walls',
  'muro': 'Wall',
  'muros': 'Walls',
  'tabique': 'Partition Wall',
  'tabiques': 'Partition Walls',
  'trasdosado': 'Wall Lining',
  'trasdosados': 'Wall Linings',
  'foseado': 'Recessed Cove',
  'candileja': 'Lighting Cove',
  'suelo': 'Flooring',
  'suelos': 'Floors',
  'pavimento': 'Flooring',
  'parquet': 'Parquet Flooring',
  'tarima': 'Wood Flooring',
  'microcemento': 'Microcement',
  'mármol': 'Marble',
  'marmol': 'Marble',
  'piedra': 'Natural Stone',
  'cerámica': 'Ceramic Tile',
  'ceramica': 'Ceramic Tile',
  'porcelánico': 'Porcelain Tile',
  'porcelanico': 'Porcelain Tile',
  'azulejo': 'Tile',
  'azulejos': 'Tiles',
  'madera': 'Wood',
  'cristal': 'Glass',
  'vidrio': 'Glass',
  'puerta': 'Door',
  'puertas': 'Doors',
  'ventana': 'Window',
  'ventanas': 'Windows',
  'estantería': 'Shelving',
  'estanteria': 'Shelving',
  'mueble': 'Custom Furniture',
  'muebles': 'Custom Furniture',
  'pintura': 'Painting',
  'alisado': 'Wall Smoothing',
  'impermeabilización': 'Waterproofing',
  'impermeabilizacion': 'Waterproofing',
  'iluminación': 'Lighting',
  'iluminacion': 'Lighting',
  'luz': 'Light',
  'luces': 'Lights',

  // Acciones y adjetivos
  'reforma': 'Renovation',
  'reformas': 'Renovations',
  'renovación': 'Renovation',
  'renovacion': 'Renovation',
  'rehabilitación': 'Restoration',
  'rehabilitacion': 'Restoration',
  'obra': 'Project',
  'obras': 'Projects',
  'proyecto': 'Project',
  'proyectos': 'Projects',
  'instalación': 'Installation',
  'instalacion': 'Installation',
  'montaje': 'Installation',
  'construcción': 'Construction',
  'construccion': 'Construction',
  'diseño': 'Design',
  'diseno': 'Design',
  'decoración': 'Interior Design',
  'decoracion': 'Interior Design',
  'acabado': 'Finish',
  'acabados': 'Finishes',
  'integral': 'Complete',
  'completa': 'Complete',
  'completo': 'Complete',
  'moderna': 'Modern',
  'moderno': 'Modern',
  'minimalista': 'Minimalist',
  'lujo': 'Luxury',
  'exclusiva': 'Exclusive',
  'exclusivo': 'Exclusive',
  'nueva': 'New',
  'nuevo': 'New',
  'interior': 'Interior',
  'exterior': 'Exterior',
  'blanco': 'White',
  'blanca': 'White',
  'negro': 'Black',
  'negra': 'Black',

  // Conectores
  'en': 'in',
  'con': 'with',
  'de': 'of',
  'del': 'of the',
  'y': 'and',
  'para': 'for',
  'por': 'by',
  'sin': 'without',
  'sobre': 'on',
  'entre': 'between',
  'el': 'the',
  'la': 'the',
  'los': 'the',
  'las': 'the',
  'un': 'a',
  'una': 'a',
};

// Diccionario completo de respaldo y precisión arquitectónica (ES -> DE)
const BACKUP_DICT_DE: Record<string, string> = {
  // Frases compuestas prioritarias
  'reforma integral de vivienda': 'Komplette Wohnungsrenovierung',
  'reforma integral de casa': 'Komplette Hausrenovierung',
  'reforma integral de baño': 'Komplette Badsanierung',
  'reforma integral de cocina': 'Komplette Küchenrenovierung',
  'reforma integral de piso': 'Komplette Wohnungsrenovierung',
  'reforma integral de chalet': 'Komplette Villenrenovierung',
  'reforma integral de local': 'Komplette Gewerberenovierung',
  'reforma integral de oficina': 'Komplette Bürorenovierung',
  'reforma de casa': 'Hausrenovierung',
  'reforma de vivienda': 'Wohnungsrenovierung',
  'reforma de piso': 'Wohnungsrenovierung',
  'reforma de baño': 'Badezimmerrenovierung',
  'reforma de cocina': 'Küchenrenovierung',
  'reforma de salón': 'Wohnzimmerrenovierung',
  'reforma de salon': 'Wohnzimmerrenovierung',
  'reforma de habitación': 'Zimmerrenovierung',
  'reforma de habitacion': 'Zimmerrenovierung',
  'reforma de dormitorio': 'Schlafzimmerrenovierung',
  'reforma de terraza': 'Terrassenrenovierung',
  'reforma de fachada': 'Fassadensanierung',
  'reforma de local': 'Gewerberaumrenovierung',
  'reforma de oficina': 'Bürorenovierung',
  'reforma integral': 'Komplette Renovierung',
  'reformas integrales': 'Umfassende Renovierungen',
  'techo falso': 'Abgehängte Decke',
  'falso techo': 'Abgehängte Decke',
  'techos falsos': 'Abgehängte Decken',
  'falsos techos': 'Abgehängte Decken',
  'techo continuo': 'Fugenlose Decke',
  'techo registrable': 'Rasterdecke',
  'techo acústico': 'Akustikdecke',
  'techo acustico': 'Akustikdecke',
  'techo de pladur': 'Rigipsdecke',
  'tabique de pladur': 'Trockenbauwand',
  'tabiques de pladur': 'Trockenbauwände',
  'pared de pladur': 'Trockenbauwand',
  'mueble de pladur': 'Trockenbaumöbel nach Maß',
  'estantería de pladur': 'Trockenbauregal nach Maß',
  'estanteria de pladur': 'Trockenbauregal nach Maß',
  'bañera exenta': 'Freistehende Badewanne',
  'banera exenta': 'Freistehende Badewanne',
  'plato de ducha': 'Bodengleiche Dusche',
  'aislamiento acústico': 'Schallschutz',
  'aislamiento acustico': 'Schallschutz',
  'aislamiento térmico': 'Wärmedämmung',
  'aislamiento termico': 'Wärmedämmung',
  'tabiquería seca': 'Trockenbauwände',
  'tabiqueria seca': 'Trockenbauwände',
  'foseado led': 'LED-Voutenbeleuchtung',
  'iluminación led': 'LED-Beleuchtung',
  'iluminacion led': 'LED-Beleuchtung',
  'iluminación indirecta': 'Indirekte Beleuchtung',
  'iluminacion indirecta': 'Indirekte Beleuchtung',
  'luz indirecta': 'Indirekte Beleuchtung',
  'luz oculta': 'Verdeckte Lichtvoute',
  'dormitorio principal': 'Hauptschlafzimmer',
  'habitación principal': 'Hauptschlafzimmer',
  'habitacion principal': 'Hauptschlafzimmer',
  'vivienda unifamiliar': 'Einfamilienhaus',
  'casa unifamiliar': 'Einfamilienhaus',
  'casa moderna': 'Modernes Haus',
  'casa rústica': 'Rustikales Haus',
  'casa rustica': 'Rustikales Haus',
  'casa de lujo': 'Luxushaus',
  'casa de campo': 'Landhaus',
  'villa de lujo': 'Luxusvilla',
  'obra nueva': 'Neubauprojekt',
  'alta gama': 'Hochwertig',
  'llave en mano': 'Schlüsselfertig',

  // Términos individuales de vivienda y estancias
  'casa': 'Haus',
  'casas': 'Häuser',
  'vivienda': 'Wohnhaus',
  'viviendas': 'Wohnungen',
  'hogar': 'Zuhause',
  'piso': 'Wohnung',
  'pisos': 'Wohnungen',
  'apartamento': 'Apartment',
  'apartamentos': 'Apartments',
  'chalet': 'Luxusvilla',
  'chalets': 'Luxusvillen',
  'finca': 'Landgut (Finca)',
  'ático': 'Penthouse',
  'atico': 'Penthouse',
  'dúplex': 'Maisonette',
  'duplex': 'Maisonette',
  'estudio': 'Studio',
  'local': 'Geschäftslokal',
  'locales': 'Geschäftsräume',
  'oficina': 'Büro',
  'oficinas': 'Büros',
  'tienda': 'Ladengeschäft',
  'restaurante': 'Restaurant',
  'hotel': 'Hotel',
  'edificio': 'Gebäude',
  'garaje': 'Garage',
  'sótano': 'Keller',
  'sotano': 'Keller',
  'buhardilla': 'Dachgeschoss',
  'salón': 'Wohnzimmer',
  'salon': 'Wohnzimmer',
  'comedor': 'Esszimmer',
  'cocina': 'Küche',
  'cocinas': 'Küchen',
  'baño': 'Badezimmer',
  'bano': 'Badezimmer',
  'baños': 'Badezimmer',
  'banos': 'Badezimmer',
  'aseo': 'Gäste-WC',
  'ducha': 'Dusche',
  'bañera': 'Badewanne',
  'banera': 'Badewanne',
  'dormitorio': 'Schlafzimmer',
  'dormitorios': 'Schlafzimmer',
  'habitación': 'Zimmer',
  'habitacion': 'Zimmer',
  'habitaciones': 'Zimmer',
  'vestidor': 'Ankleidezimmer',
  'armario': 'Einbauschrank',
  'armarios': 'Einbauschränke',
  'pasillo': 'Flur',
  'recibidor': 'Eingangsbereich',
  'entrada': 'Eingang',
  'terraza': 'Terrasse',
  'terrazas': 'Terrassen',
  'balcón': 'Balkon',
  'balcon': 'Balkon',
  'jardín': 'Garten',
  'jardin': 'Garten',
  'piscina': 'Pool',
  'porche': 'Veranda',
  'fachada': 'Fassade',
  'fachadas': 'Fassaden',
  'escalera': 'Treppe',
  'escaleras': 'Treppen',

  // Materiales y elementos constructivos
  'pladur': 'Trockenbau',
  'insonorización': 'Schalldämmung',
  'insonorizacion': 'Schalldämmung',
  'aislamiento': 'Dämmung',
  'acústico': 'Akustik',
  'acustico': 'Akustik',
  'acústica': 'Akustik',
  'acustica': 'Akustik',
  'térmico': 'Wärmedämmung',
  'termico': 'Wärmedämmung',
  'térmica': 'Wärmedämmung',
  'termica': 'Wärmedämmung',
  'techo': 'Decke',
  'techos': 'Decken',
  'pared': 'Wand',
  'paredes': 'Wände',
  'muro': 'Mauer',
  'muros': 'Mauern',
  'tabique': 'Trennwand',
  'tabiques': 'Trennwände',
  'trasdosado': 'Wandverkleidung',
  'trasdosados': 'Wandverkleidungen',
  'foseado': 'Lichtvoute',
  'candileja': 'Lichtvoute',
  'suelo': 'Boden',
  'suelos': 'Böden',
  'pavimento': 'Bodenbelag',
  'parquet': 'Parkettboden',
  'tarima': 'Holzboden',
  'microcemento': 'Mikrozement',
  'mármol': 'Marmor',
  'marmol': 'Marmor',
  'piedra': 'Naturstein',
  'cerámica': 'Keramikfliesen',
  'ceramica': 'Keramikfliesen',
  'porcelánico': 'Feinsteinzeug',
  'porcelanico': 'Feinsteinzeug',
  'azulejo': 'Fliese',
  'azulejos': 'Fliesen',
  'madera': 'Holz',
  'cristal': 'Glas',
  'vidrio': 'Glas',
  'puerta': 'Tür',
  'puertas': 'Türen',
  'ventana': 'Fenster',
  'ventanas': 'Fenster',
  'estantería': 'Regal',
  'estanteria': 'Regal',
  'mueble': 'Maßmöbel',
  'muebles': 'Maßmöbel',
  'pintura': 'Malerarbeiten',
  'alisado': 'Wandglättung',
  'impermeabilización': 'Abdichtung',
  'impermeabilizacion': 'Abdichtung',
  'iluminación': 'Beleuchtung',
  'iluminacion': 'Beleuchtung',
  'luz': 'Licht',
  'luces': 'Lichter',

  // Acciones y adjetivos
  'reforma': 'Renovierung',
  'reformas': 'Renovierungen',
  'renovación': 'Renovierung',
  'renovacion': 'Renovierung',
  'rehabilitación': 'Sanierung',
  'rehabilitacion': 'Sanierung',
  'obra': 'Bauprojekt',
  'obras': 'Bauprojekte',
  'proyecto': 'Projekt',
  'proyectos': 'Projekte',
  'instalación': 'Installation',
  'instalacion': 'Installation',
  'montaje': 'Montage',
  'construcción': 'Bau',
  'construccion': 'Bau',
  'diseño': 'Design',
  'diseno': 'Design',
  'decoración': 'Innenarchitektur',
  'decoracion': 'Innenarchitektur',
  'acabado': 'Ausführung',
  'acabados': 'Ausführungen',
  'integral': 'Komplett',
  'completa': 'Komplett',
  'completo': 'Komplett',
  'moderna': 'Modern',
  'moderno': 'Modern',
  'minimalista': 'Minimalistisch',
  'lujo': 'Luxus',
  'exclusiva': 'Exklusiv',
  'exclusivo': 'Exklusiv',
  'nueva': 'Neu',
  'nuevo': 'Neu',
  'interior': 'Innenbereich',
  'exterior': 'Außenbereich',
  'blanco': 'Weiß',
  'blanca': 'Weiß',
  'negro': 'Schwarz',
  'negra': 'Schwarz',

  // Conectores
  'en': 'in',
  'con': 'mit',
  'de': 'von',
  'del': 'des',
  'y': 'und',
  'para': 'für',
  'por': 'durch',
  'sin': 'ohne',
  'sobre': 'über',
  'entre': 'zwischen',
  'el': 'der',
  'la': 'die',
  'los': 'die',
  'las': 'die',
  'un': 'ein',
  'una': 'eine',
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Traductor composicional Unicode (soporta tildes y ñ sin fallos de \b)
 */
function translateWithBackupDict(text: string, lang: 'en' | 'de'): string {
  const dict = lang === 'en' ? BACKUP_DICT_EN : BACKUP_DICT_DE;
  const lower = text.trim().toLowerCase().replace(/\s+/g, ' ');

  // 1. Coincidencia exacta inmediata
  if (dict[lower]) {
    return dict[lower];
  }

  // 2. Reemplazo por frases de mayor a menor longitud con bordes Unicode reales
  let result = text.trim();
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  const wordChar = 'a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ';

  for (const k of keys) {
    const escaped = escapeRegExp(k);
    const rx = new RegExp(`(?<![${wordChar}])${escaped}(?![${wordChar}])`, 'gi');
    if (rx.test(result)) {
      result = result.replace(rx, dict[k]);
    }
  }

  return capitalizeFirstLetter(result);
}

/**
 * Comprueba si una traducción devuelta por una API externa realmente tradujo el texto
 * y no se limitó a devolver el mismo texto en español sin traducir.
 */
function isValidTranslation(originalEs: string, translated: string | null): boolean {
  if (!translated || !translated.trim()) return false;
  const normOrig = originalEs.trim().toLowerCase();
  const normTrans = translated.trim().toLowerCase();

  // Si es una palabra internacional válida (Villa, Penthouse, Mallorca...), es válida aunque coincida
  if (INTERNATIONAL_WORDS.has(normOrig)) return true;

  // Si la API devolvió exactamente lo mismo que en español, considerarlo no traducido
  if (normOrig === normTrans) return false;

  // Evitar mensajes de error de cuota de APIs gratuitas
  if (normTrans.includes('mymemory') || normTrans.includes('quota') || normTrans.includes('warning')) {
    return false;
  }

  return true;
}

/**
 * Motor Online 1: Google Translate API (GTX) con timeout de 2.2s
 */
async function fetchGoogleTranslation(text: string, targetLang: 'en' | 'de'): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const fullTranslation = data[0].map((chunk: any) => chunk[0]).join('');
        const cleaned = capitalizeFirstLetter(decodeHtmlEntities(fullTranslation));
        if (isValidTranslation(text, cleaned)) {
          return cleaned;
        }
      }
    }
  } catch {
    // Silencioso: pasa al motor 2 o diccionario
  }
  return null;
}

/**
 * Motor Online 2: MyMemory API (CORS nativo para Safari / iOS) con timeout de 2.2s
 */
async function fetchMyMemoryTranslation(text: string, targetLang: 'en' | 'de'): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|${targetLang}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const raw = data?.responseData?.translatedText;
      if (typeof raw === 'string' && raw.trim()) {
        const cleaned = capitalizeFirstLetter(decodeHtmlEntities(raw));
        if (isValidTranslation(text, cleaned)) {
          return cleaned;
        }
      }
    }
  } catch {
    // Silencioso: pasa al diccionario local
  }
  return null;
}

/**
 * Obtiene la mejor traducción para un idioma combinando diccionario exacto + motores online + fallback
 */
async function translateSingleLang(cleanTitle: string, targetLang: 'en' | 'de'): Promise<string> {
  const dict = targetLang === 'en' ? BACKUP_DICT_EN : BACKUP_DICT_DE;
  const lower = cleanTitle.toLowerCase().replace(/\s+/g, ' ');

  // 1. Si el término completo está en nuestro diccionario técnico curado (ej. "casa", "pladur", "reforma integral"),
  // devolvemos la traducción arquitectónica exacta al instante (0ms y 100% precisión técnica).
  if (dict[lower]) {
    return dict[lower];
  }

  // 2. Para frases libres complejas, probamos Google Translate primero
  const googleRes = await fetchGoogleTranslation(cleanTitle, targetLang);
  if (googleRes) return googleRes;

  // 3. Si Safari ITP bloquea Google o Google no traduce, probamos MyMemory API
  const myMemoryRes = await fetchMyMemoryTranslation(cleanTitle, targetLang);
  if (myMemoryRes) return myMemoryRes;

  // 4. Respaldo composicional garantizado offline palabra por palabra
  return translateWithBackupDict(cleanTitle, targetLang);
}

export interface TranslationResult {
  titleEn: string;
  titleDe: string;
  locationEn: string;
  locationDe: string;
}

/**
 * Función principal para autotraducir título y ubicación a inglés y alemán
 */
export async function autoTranslateWork(
  titleEs: string,
  locationEs: string = 'Mallorca'
): Promise<TranslationResult> {
  const cleanTitle = titleEs.trim();
  if (!cleanTitle) {
    return {
      titleEn: '',
      titleDe: '',
      locationEn: locationEs,
      locationDe: locationEs,
    };
  }

  // Traducción simultánea a inglés y alemán
  const [titleEn, titleDe] = await Promise.all([
    translateSingleLang(cleanTitle, 'en'),
    translateSingleLang(cleanTitle, 'de'),
  ]);

  const locEn = locationEs.includes('Mallorca')
    ? locationEs.replace('Mallorca', 'Mallorca, Balearic Islands')
    : `${locationEs}, Mallorca`;

  const locDe = locationEs.includes('Mallorca')
    ? locationEs.replace('Mallorca', 'Mallorca, Balearen')
    : `${locationEs}, Mallorca`;

  return {
    titleEn,
    titleDe,
    locationEn: locEn,
    locationDe: locDe,
  };
}
