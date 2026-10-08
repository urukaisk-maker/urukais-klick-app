import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const DICT: Record<string, string> = {
  'olive oil': 'Aceite de oliva',
  'vegetable oil': 'Aceite vegetal',
  'sunflower oil': 'Aceite de girasol',
  butter: 'Mantequilla',
  'unsalted butter': 'Mantequilla sin sal',
  margarine: 'Margarina',
  lard: 'Manteca de cerdo',
  onion: 'Cebolla',
  onions: 'Cebollas',
  garlic: 'Ajo',
  'garlic cloves': 'Dientes de ajo',
  'garlic clove': 'Diente de ajo',
  tomato: 'Tomate',
  tomatoes: 'Tomates',
  'cherry tomatoes': 'Tomates cherry',
  potato: 'Patata',
  potatoes: 'Patatas',
  carrot: 'Zanahoria',
  carrots: 'Zanahorias',
  'red pepper': 'Pimiento rojo',
  'green pepper': 'Pimiento verde',
  'bell pepper': 'Pimiento morrón',
  chilli: 'Chile',
  chili: 'Chile',
  'chilli powder': 'Chile en polvo',
  'cayenne pepper': 'Pimienta de cayena',
  parsley: 'Perejil',
  'fresh parsley': 'Perejil fresco',
  coriander: 'Cilantro',
  basil: 'Albahaca',
  oregano: 'Orégano',
  thyme: 'Tomillo',
  rosemary: 'Romero',
  mint: 'Menta',
  ginger: 'Jengibre',
  'fresh ginger': 'Jengibre fresco',
  lemon: 'Limón',
  lime: 'Lima',
  'lemon juice': 'Zumo de limón',
  'lime juice': 'Zumo de lima',
  'lemon zest': 'Ralladura de limón',
  orange: 'Naranja',
  apple: 'Manzana',
  apples: 'Manzanas',
  banana: 'Plátano',
  bananas: 'Plátanos',
  strawberry: 'Fresa',
  strawberries: 'Fresas',
  blueberry: 'Arándano',
  blueberries: 'Arándanos',
  raspberry: 'Frambuesa',
  avocado: 'Aguacate',
  aubergine: 'Berenjena',
  eggplant: 'Berenjena',
  courgette: 'Calabacín',
  zucchini: 'Calabacín',
  cucumber: 'Pepino',
  lettuce: 'Lechuga',
  spinach: 'Espinacas',
  cabbage: 'Col',
  cauliflower: 'Coliflor',
  broccoli: 'Brócoli',
  mushroom: 'Champiñón',
  mushrooms: 'Champiñones',
  celery: 'Apio',
  leek: 'Puerro',
  'green beans': 'Judías verdes',
  peas: 'Guisantes',
  chickpeas: 'Garbanzos',
  lentils: 'Lentejas',
  'kidney beans': 'Alubias rojas',
  'black beans': 'Alubias negras',
  chicken: 'Pollo',
  'chicken breast': 'Pechuga de pollo',
  'chicken breasts': 'Pechugas de pollo',
  'chicken thighs': 'Muslos de pollo',
  'chicken stock': 'Caldo de pollo',
  beef: 'Carne de vaca',
  'beef mince': 'Carne picada de vaca',
  'ground beef': 'Carne picada de vaca',
  'minced beef': 'Carne picada de vaca',
  steak: 'Filete',
  pork: 'Cerdo',
  'pork chops': 'Chuletas de cerdo',
  bacon: 'Bacon',
  ham: 'Jamón',
  chorizo: 'Chorizo',
  sausage: 'Salchicha',
  sausages: 'Salchichas',
  lamb: 'Cordero',
  'lamb chops': 'Chuletas de cordero',
  duck: 'Pato',
  turkey: 'Pavo',
  fish: 'Pescado',
  salmon: 'Salmón',
  tuna: 'Atún',
  cod: 'Bacalao',
  prawns: 'Gambas',
  prawn: 'Gamba',
  shrimp: 'Gambas',
  shrimps: 'Gambas',
  'raw tiger prawns': 'Langostinos crudos',
  'king prawns': 'Langostinos',
  mussels: 'Mejillones',
  clams: 'Almejas',
  squid: 'Calamar',
  octopus: 'Pulpo',
  crab: 'Cangrejo',
  lobster: 'Langosta',
  egg: 'Huevo',
  eggs: 'Huevos',
  milk: 'Leche',
  cream: 'Nata',
  'double cream': 'Nata para montar',
  'single cream': 'Nata líquida',
  'heavy cream': 'Nata para montar',
  cheese: 'Queso',
  'parmesan cheese': 'Queso parmesano',
  parmesan: 'Parmesano',
  'cheddar cheese': 'Queso cheddar',
  mozzarella: 'Mozzarella',
  yoghurt: 'Yogur',
  yogurt: 'Yogur',
  flour: 'Harina',
  'plain flour': 'Harina de trigo',
  'self-raising flour': 'Harina con levadura',
  bread: 'Pan',
  'bread crumbs': 'Pan rallado',
  breadcrumbs: 'Pan rallado',
  rice: 'Arroz',
  'white rice': 'Arroz blanco',
  'basmati rice': 'Arroz basmati',
  pasta: 'Pasta',
  spaghetti: 'Espaguetis',
  macaroni: 'Macarrones',
  noodles: 'Fideos',
  oats: 'Avena',
  sugar: 'Azúcar',
  'brown sugar': 'Azúcar moreno',
  'caster sugar': 'Azúcar glas',
  honey: 'Miel',
  salt: 'Sal',
  'sea salt': 'Sal marina',
  pepper: 'Pimienta',
  'black pepper': 'Pimienta negra',
  saffron: 'Azafrán',
  cinnamon: 'Canela',
  nutmeg: 'Nuez moscada',
  cumin: 'Comino',
  paprika: 'Pimentón',
  turmeric: 'Cúrcuma',
  curry: 'Curry',
  'curry powder': 'Curry en polvo',
  vanilla: 'Vainilla',
  'vanilla extract': 'Extracto de vainilla',
  vinegar: 'Vinagre',
  'balsamic vinegar': 'Vinagre balsámico',
  'soy sauce': 'Salsa de soja',
  mustard: 'Mostaza',
  mayonnaise: 'Mayonesa',
  ketchup: 'Kétchup',
  'tomato sauce': 'Salsa de tomate',
  'tomato puree': 'Puré de tomate',
  'tomato paste': 'Concentrado de tomate',
  mirin: 'Mirin',
  dashi: 'Dashi',
  'sesame oil': 'Aceite de sésamo',
  'sesame seeds': 'Semillas de sésamo',
  water: 'Agua',
  wine: 'Vino',
  'red wine': 'Vino tinto',
  'white wine': 'Vino blanco',
  'dry sherry': 'Jerez seco',
  sherry: 'Jerez',
  beer: 'Cerveza',
  stock: 'Caldo',
  'vegetable stock': 'Caldo de verduras',
  'beef stock': 'Caldo de carne',
  'chicken stock cube': 'Pastilla de caldo de pollo',
  'coconut milk': 'Leche de coco',
  'baking powder': 'Levadura en polvo',
  'bicarbonate of soda': 'Bicarbonato sódico',
  yeast: 'Levadura',
  gelatin: 'Gelatina',
  chocolate: 'Chocolate',
  'dark chocolate': 'Chocolate negro',
  'cocoa powder': 'Cacao en polvo',
  nuts: 'Frutos secos',
  almonds: 'Almendras',
  walnuts: 'Nueces',
  peanuts: 'Cacahuetes',
  raisins: 'Pasas',
  dates: 'Dátiles',
  olives: 'Aceitunas',
  capers: 'Alcaparras',
  pickles: 'Encurtidos',
  tofu: 'Tofu',
  cornflour: 'Maicena',
  'corn starch': 'Maicena',
  'spring onions': 'Cebolletas',
  'spring onion': 'Cebolleta',
  shallot: 'Chalota',
  shallots: 'Chalotas',
};

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly TTL = 1000 * 60 * 60 * 24 * 7;

  private readonly userAgent =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

  /**
   * Estrategia:
   * - Texto corto (≤ 4 palabras) → Diccionario local (instantáneo)
   * - Texto largo → Google Translate (mejor calidad)
   * - Si Google falla → Diccionario local como fallback
   */
  async toSpanish(text: string): Promise<string> {
    if (!text || !text.trim()) return text;

    const key = text.trim();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    let result: string | null = null;

    const wordCount = key.split(/\s+/).length;
    const lowerKey = key.toLowerCase();

    // 1. Coincidencia EXACTA con ingredientes del diccionario
    if (DICT[lowerKey]) {
      result = DICT[lowerKey];
    }
    // 2. Texto muy corto (≤4 palabras) → diccionario por si es un ingrediente variante
    else if (wordCount <= 4) {
      result = this.applyDictWords(key);
    }
    // 3. Texto largo → Google Translate
    else {
      result = await this.google(key);
      // Si Google falla, fallback al diccionario (aunque quede mezclado)
      if (!result) {
        result = this.applyDictWords(key);
      }
    }

    const final = result ?? text;

    this.cache.set(key, {
      value: final,
      expiresAt: Date.now() + this.TTL,
    });

    return final;
  }

  async toSpanishBatch(items: string[]): Promise<string[]> {
    if (!items?.length) return [];
    return Promise.all(items.map((t) => this.toSpanish(t)));
  }

  private async google(text: string): Promise<string | null> {
    try {
      const { data } = await axios.get(
        'https://translate.googleapis.com/translate_a/single',
        {
          params: {
            client: 'gtx',
            sl: 'en',
            tl: 'es',
            dt: 't',
            q: text.slice(0, 2000),
          },
          headers: {
            'User-Agent': this.userAgent,
            Accept: 'application/json, text/plain, */*',
          },
          timeout: 6000,
        },
      );

      const translated = data?.[0]?.map((p: any[]) => p[0]).join('');
      return translated || null;
    } catch (error: any) {
      this.logger.warn(
        `Google falló: ${error?.message ?? 'unknown'}`,
      );
      return null;
    }
  }

  /** Sustituye palabras del diccionario dentro de un texto (fallback) */
  private applyDictWords(text: string): string {
    let result = text;
    const keys = Object.keys(DICT).sort((a, b) => b.length - a.length);
    for (const en of keys) {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      if (regex.test(result)) {
        result = result.replace(regex, DICT[en]);
      }
    }
    return result;
  }
}