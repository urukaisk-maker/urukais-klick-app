import { Injectable, HttpException, Logger } from '@nestjs/common';
import axios from 'axios';
import { TranslateService } from '../common/translate.service';

export interface RecipeSummary {
  id: string;
  title: string;
  url: string;
  image_url?: string;
  description?: string;
  category?: string;
  area?: string;
}

export interface RecipeDetail extends RecipeSummary {
  ingredients: { name: string; measure: string }[];
  steps: string[];
  tags?: string[];
  source?: string;
  youtube?: string;
}

const CATEGORY_ES: Record<string, string> = {
  Beef: 'Carne',
  Breakfast: 'Desayuno',
  Chicken: 'Pollo',
  Dessert: 'Postre',
  Goat: 'Cabra',
  Lamb: 'Cordero',
  Miscellaneous: 'Varios',
  Pasta: 'Pasta',
  Pork: 'Cerdo',
  Seafood: 'Mariscos',
  Side: 'Acompañamiento',
  Starter: 'Entrante',
  Vegan: 'Vegano',
  Vegetarian: 'Vegetariano',
};

const AREA_ES: Record<string, string> = {
  American: 'Estadounidense',
  British: 'Británica',
  Chinese: 'China',
  Croatian: 'Croata',
  Dutch: 'Holandesa',
  Egyptian: 'Egipcia',
  Filipino: 'Filipina',
  French: 'Francesa',
  Greek: 'Griega',
  Indian: 'India',
  Irish: 'Irlandesa',
  Italian: 'Italiana',
  Jamaican: 'Jamaicana',
  Japanese: 'Japonesa',
  Kenyan: 'Keniana',
  Malaysian: 'Malasia',
  Mexican: 'Mexicana',
  Moroccan: 'Marroquí',
  Polish: 'Polaca',
  Portuguese: 'Portuguesa',
  Russian: 'Rusa',
  Spanish: 'Española',
  Thai: 'Tailandesa',
  Tunisian: 'Tunecina',
  Turkish: 'Turca',
  Ukrainian: 'Ucraniana',
  Uruguayan: 'Uruguaya',
  Vietnamese: 'Vietnamita',
};

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);
  private readonly baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  constructor(private readonly translate: TranslateService) {}

  async searchRecipes(query: string, limit = 12): Promise<RecipeSummary[]> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/search.php`, {
        params: { s: query },
      });
      const meals = (data?.meals ?? []).slice(0, limit);

      // Traducir títulos en batch
      const titles = await this.translate.toSpanishBatch(
        meals.map((m: any) => m.strMeal),
      );

      return meals.map((m: any, i: number) =>
        this.toSummary(m, titles[i]),
      );
    } catch (error: any) {
      this.logger.error('Error buscando recetas', error?.message);
      throw new HttpException('Error al buscar recetas', 502);
    }
  }

  async getByArea(area: string, limit = 24): Promise<RecipeSummary[]> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/filter.php`, {
        params: { a: area },
      });
      const meals = (data?.meals ?? []).slice(0, limit);

      const titles = await this.translate.toSpanishBatch(
        meals.map((m: any) => m.strMeal),
      );

      return meals.map((m: any, i: number) => ({
        id: m.idMeal,
        title: titles[i],
        url: `https://www.themealdb.com/meal/${m.idMeal}`,
        image_url: m.strMealThumb,
        area: AREA_ES[area] ?? area,
      }));
    } catch (error: any) {
      this.logger.error('Error filtrando recetas', error?.message);
      throw new HttpException('Error al filtrar recetas', 502);
    }
  }

  async getByCategory(category: string, limit = 24): Promise<RecipeSummary[]> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/filter.php`, {
        params: { c: category },
      });
      const meals = (data?.meals ?? []).slice(0, limit);

      const titles = await this.translate.toSpanishBatch(
        meals.map((m: any) => m.strMeal),
      );

      return meals.map((m: any, i: number) => ({
        id: m.idMeal,
        title: titles[i],
        url: `https://www.themealdb.com/meal/${m.idMeal}`,
        image_url: m.strMealThumb,
        category: CATEGORY_ES[category] ?? category,
      }));
    } catch (error: any) {
      this.logger.error('Error filtrando recetas', error?.message);
      throw new HttpException('Error al filtrar recetas', 502);
    }
  }

  async getRecipe(id: string): Promise<RecipeDetail> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/lookup.php`, {
        params: { i: id },
      });
      const meal = data?.meals?.[0];
      if (!meal) throw new HttpException('Receta no encontrada', 404);

      // Ingredientes originales
      const rawIngredients: { name: string; measure: string }[] = [];
      for (let i = 1; i <= 20; i++) {
        const name = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (name && name.trim()) {
          rawIngredients.push({
            name: name.trim(),
            measure: (measure ?? '').trim(),
          });
        }
      }

      // Pasos originales
      const rawSteps = (meal.strInstructions ?? '')
        .split(/\r?\n/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      // Traducir título + ingredientes + pasos
      const [translatedTitle, translatedIngNames, translatedSteps] =
        await Promise.all([
          this.translate.toSpanish(meal.strMeal),
          this.translate.toSpanishBatch(rawIngredients.map((i) => i.name)),
          this.translate.toSpanishBatch(rawSteps),
        ]);

      const ingredients = rawIngredients.map((ing, i) => ({
        name: translatedIngNames[i],
        measure: ing.measure,
      }));

      return {
        id: meal.idMeal,
        title: translatedTitle,
        url: `https://www.themealdb.com/meal/${meal.idMeal}`,
        image_url: meal.strMealThumb,
        description: rawSteps[0]?.slice(0, 200) + '...',
        category: CATEGORY_ES[meal.strCategory] ?? meal.strCategory,
        area: AREA_ES[meal.strArea] ?? meal.strArea,
        ingredients,
        steps: translatedSteps,
        tags: meal.strTags
          ? meal.strTags.split(',').map((t: string) => t.trim())
          : [],
        source: meal.strSource,
        youtube: meal.strYoutube,
      };
    } catch (error: any) {
      if (error.status === 404) throw error;
      this.logger.error('Error obteniendo receta', error?.message);
      throw new HttpException('Receta no encontrada', 404);
    }
  }

  private toSummary = (m: any, translatedTitle?: string): RecipeSummary => ({
    id: m.idMeal,
    title: translatedTitle ?? m.strMeal,
    url: `https://www.themealdb.com/meal/${m.idMeal}`,
    image_url: m.strMealThumb,
    description: m.strInstructions
      ? m.strInstructions.slice(0, 150) + '...'
      : undefined,
    category: CATEGORY_ES[m.strCategory] ?? m.strCategory,
    area: AREA_ES[m.strArea] ?? m.strArea,
  });
}