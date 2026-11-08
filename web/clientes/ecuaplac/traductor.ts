/**
 * Motor de Traducción Profesional para Ecuaplac (ES -> EN & DE)
 * Conectado con la API de traducción de Google + diccionario local de reformas de Mallorca.
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
  const cleaned = str.trim();
  if (!cleaned) return '';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Diccionario de respaldo local (Offline / Fallback garantizado)
const BACKUP_DICT_EN: Record<string, string> = {
  'techo falso': 'False Ceiling',
  'falso techo': 'False Ceiling',
  'techos falsos': 'Suspended Ceilings',
  'falsos techos': 'Suspended Ceilings',
  'reforma integral': 'Complete Renovation',
  'reformas integrales': 'Comprehensive Renovations',
  'reforma de baño': 'Bathroom Renovation',
  'reforma de cocina': 'Kitchen Renovation',
  'bañera exenta': 'Freestanding Bathtub',
  'pladur': 'Drywall',
  'insonorización': 'Soundproofing',
  'insonorizacion': 'Soundproofing',
  'aislamiento acústico': 'Acoustic Insulation',
  'aislamiento acustico': 'Acoustic Insulation',
  'aislamiento térmico': 'Thermal Insulation',
  'tabiquería seca': 'Drywall Partitioning',
  'foseado led': 'LED Cove Lighting',
  'iluminación led': 'LED Lighting',
  'luz indirecta': 'Indirect Lighting',
  'salón': 'Living Room',
  'dormitorio principal': 'Master Bedroom',
  'vivienda unifamiliar': 'Detached House',
  'chalet': 'Luxury Villa',
  'ático': 'Penthouse',
  'terraza': 'Terrace',
};

const BACKUP_DICT_DE: Record<string, string> = {
  'techo falso': 'Abgehängte Decke',
  'falso techo': 'Abgehängte Decke',
  'techos falsos': 'Abgehängte Decken',
  'falsos techos': 'Abgehängte Decken',
  'reforma integral': 'Komplette Renovierung',
  'reformas integrales': 'Umfassende Renovierungen',
  'reforma de baño': 'Badezimmerrenovierung',
  'reforma de cocina': 'Küchenrenovierung',
  'bañera exenta': 'Freistehende Badewanne',
  'pladur': 'Trockenbau',
  'insonorización': 'Schalldämmung',
  'insonorizacion': 'Schalldämmung',
  'aislamiento acústico': 'Schallschutz',
  'aislamiento acustico': 'Schallschutz',
  'aislamiento térmico': 'Wärmedämmung',
  'tabiquería seca': 'Trockenbauwände',
  'foseado led': 'LED-Voutenbeleuchtung',
  'iluminación led': 'LED-Beleuchtung',
  'luz indirecta': 'Indirekte Beleuchtung',
  'salón': 'Wohnzimmer',
  'dormitorio principal': 'Hauptschlafzimmer',
  'vivienda unifamiliar': 'Einfamilienhaus',
  'chalet': 'Luxusvilla',
  'ático': 'Penthouse',
  'terraza': 'Terrasse',
};

function translateWithBackupDict(text: string, lang: 'en' | 'de'): string {
  const dict = lang === 'en' ? BACKUP_DICT_EN : BACKUP_DICT_DE;
  const lower = text.trim().toLowerCase();

  if (dict[lower]) {
    return dict[lower];
  }

  let result = text.trim();
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    const rx = new RegExp(`\\b${k}\\b`, 'gi');
    if (rx.test(result)) {
      result = result.replace(rx, dict[k]);
    }
  }
  return capitalizeFirstLetter(result);
}

/**
 * Traduce mediante Google Translate API con timeout de 2.5s
 */
async function fetchGoogleTranslation(text: string, targetLang: 'en' | 'de'): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const fullTranslation = data[0].map((chunk: any) => chunk[0]).join('');
        if (fullTranslation) {
          return capitalizeFirstLetter(decodeHtmlEntities(fullTranslation));
        }
      }
    }
  } catch (err) {
    console.warn(`[Traductor] Falla API online para ${targetLang}, usando respaldo local:`, err);
  }
  return null;
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
  const [googleEn, googleDe] = await Promise.all([
    fetchGoogleTranslation(cleanTitle, 'en'),
    fetchGoogleTranslation(cleanTitle, 'de'),
  ]);

  const titleEn = googleEn || translateWithBackupDict(cleanTitle, 'en');
  const titleDe = googleDe || translateWithBackupDict(cleanTitle, 'de');

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
