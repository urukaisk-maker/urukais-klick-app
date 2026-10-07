import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AudiusService {
  private readonly logger = new Logger(AudiusService.name);
  // Audius tiene varios nodos; usamos el "discovery provider" oficial
  private readonly baseUrl = 'https://api.audius.co/v1';
  // App name registrado (Audius pide un nombre de app para identificar tráfico)
  private readonly appName = 'UrukaisKlick';

  constructor(private readonly httpService: HttpService) {}

  private get params() {
    return { app_name: this.appName };
  }

  async searchTracks(query: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/tracks/search`, {
          params: { ...this.params, query, limit: 20 },
        }),
      );
      return data.data ?? [];
    } catch (error: any) {
      this.logger.error('Error buscando en Audius', error?.message);
      throw new HttpException(
        'Error al buscar canciones en Audius',
        502,
      );
    }
  }

  async getTrendingTracks(genre?: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/tracks/trending`, {
          params: {
            ...this.params,
            limit: 20,
            ...(genre && { genre }),
          },
        }),
      );
      return data.data ?? [];
    } catch (error: any) {
      this.logger.error('Error en trending de Audius', error?.message);
      throw new HttpException(
        'Error al obtener canciones trending de Audius',
        502,
      );
    }
  }

  async getTrackStream(trackId: string) {
    try {
      // Endpoint oficial: /tracks/{track_id}/stream
      // Redirige a la URL real del stream
      const url = `${this.baseUrl}/tracks/${trackId}/stream?app_name=${this.appName}`;
      return { url, trackId };
    } catch (error) {
      throw new HttpException('Error al obtener stream', 500);
    }
  }
}
