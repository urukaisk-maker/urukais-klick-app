import { Throttle } from '@nestjs/throttler';
import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] as string;
    const ip = req.ip ?? (req.socket?.remoteAddress as string);

    const { accessToken, refreshToken, user } = await this.auth.register(
      dto,
      userAgent,
      ip,
    );
    this.setCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] as string;
    const ip = req.ip ?? (req.socket?.remoteAddress as string);

    const { accessToken, refreshToken, user } = await this.auth.login(
      dto,
      userAgent,
      ip,
    );
    this.setCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refrescar access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) return { message: 'Sin refresh token' };

    const decoded: any = this.decode(refreshToken);
    const tokens = await this.auth.refresh(decoded.sub, refreshToken);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Token refrescado' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(userId);
    this.clearCookies(res);
    return { message: 'Sesión cerrada' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(200)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Cerrar sesión en TODOS los dispositivos' })
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logoutAll(userId);
    this.clearCookies(res);
    return { message: 'Sesión cerrada en todos los dispositivos' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Ver mis sesiones activas' })
  async getSessions(@CurrentUser('id') userId: string) {
    return this.auth.getSessions(userId);
  }

  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });
  }

  private clearCookies(res: Response) {
    res.clearCookie('access_token', { sameSite: 'none', secure: true });
    res.clearCookie('refresh_token', {
      path: '/api/auth',
      sameSite: 'none',
      secure: true,
    });
  }

  private decode(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(Buffer.from(payload, 'base64').toString());
    } catch {
      return null;
    }
  }
}
