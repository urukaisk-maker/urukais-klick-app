import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const DICT: Record<string, string> = {
  // Aceites y grasas
  'olive oil': 'Aceite de oliva',
  'vegetable oil': 'Aceite vegetal',
  'sunflower oil': 'Aceite de girasol',
  butter: 'Mantequilla',
  'unsalted butter': 'Mantequilla sin sal',
  margarine: 'Margarina',
  lard: 'Manteca de cerdo',

  // Verduras y hortalizas
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

  // Carnes
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

  // Pescados y mariscos
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

  // Lácteos y huevos
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

  // Cereales y harinas
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

  // Especias y condimentos
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

  // Bebidas y líquidos
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

  // Otros
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
  'sesame oil': 'Aceite de sésamo',
  'sesame seeds': 'Semillas de sésamo',
  cornflour: 'Maicena',
  'corn starch': 'Maicena',
  'spring onions': 'Cebolletas',
  'spring onion': 'Cebolleta',
  shallot: 'Chalota',
  shallots: 'Chalotas',
};

const PHRASES: [RegExp, string][] = [
  [/\bput\b/gi, 'pon'],
  [/\badd\b/gi, 'añade'],
  [/\bmix\b/gi, 'mezcla'],
  [/\bheat\b/gi, 'calienta'],
  [/\bcook\b/gi, 'cocina'],
  [/\bstir\b/gi, 'remueve'],
  [/\bremove\b/gi, 'retira'],
  [/\bseason\b/gi, 'sazona'],
  [/\bstep (\d+)/gi, 'Paso $1'],
  [/\btablespoon(s)?\b/gi, 'cucharada$1'],
  [/\bteaspoon(s)?\b/gi, 'cucharadita$1'],
  [/\bcup(s)?\b/gi, 'taza$1'],
  [/\btbsp\b/gi, 'cda'],
  [/\btsp\b/gi, 'cdta'],
  [/\buntil\b/gi, 'hasta que'],
  [/\bthen\b/gi, 'luego'],
  [/\bfor (\d+)/gi, 'durante $1'],
];

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly TTL = 1000 * 60 * 60 * 24 * 7;

  async toSpanish(text: string): Promise<string> {
    if (!text || !text.trim()) return text;

    const key = text.trim().toLowerCase();

    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    let result: string | null = null;

    if (DICT[key]) {
      result = DICT[key];
    } else {
      let modified = text;
      let replaced = false;

      for (const [regex, replacement] of PHRASES) {
        if (regex.test(modified)) {
          modified = modified.replace(regex, replacement);
          replaced = true;
        }
      }

      let wordsModified = modified;
      for (const [en, es] of Object.entries(DICT)) {
        const wordRegex = new RegExp(`\\b${en}\\b`, 'gi');
        if (wordRegex.test(wordsModified)) {
          wordsModified = wordsModified.replace(wordRegex, es);
          replaced = true;
        }
      }

      if (replaced) {
        result = wordsModified;
      } else {
        result = await this.mymemory(text);
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

  private async mymemory(text: string): Promise<string> {
    try {
      const { data } = await axios.get(
        'https://api.mymemory.translated.net/get',
        {
          params: {
            q: text.slice(0, 500),
            langpair: 'en|es',
          },
          timeout: 5000,
        },
      );
      return data?.responseData?.translatedText ?? text;
    } catch (error: any) {
      this.logger.warn(
        `Traducción fallida para "${text.slice(0, 40)}...": ${error?.message ?? 'unknown'}`,
      );
      return text;
    }
  }
}