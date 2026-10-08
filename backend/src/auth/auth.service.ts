import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// 🔐 Contraseñas comunes bloqueadas
const WEAK_PASSWORDS = [
  'password123',
  'qwertyuiop',
  'Password123!',
  'Admin12345!',
  'Demo12345!',
  'Password1234!',
];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto, userAgent?: string, ip?: string) {
    if (
      WEAK_PASSWORDS.some(
        (p) => p.toLowerCase() === dto.password.toLowerCase(),
      )
    ) {
      throw new ConflictException(
        'Esta contraseña es demasiado común. Elige otra distinta.',
      );
    }

    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });
    if (exists) throw new ConflictException('Email o username ya en uso');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        displayName: dto.displayName ?? dto.username,
      },
    });

    await this.prisma.mascot.create({
      data: { userId: user.id, name: user.mascotName },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      userAgent,
      ip,
    );
    return { user: this.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto, userAgent?: string, ip?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      userAgent,
      ip,
    );
    return { user: this.sanitize(user), ...tokens };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();

    const session = await this.prisma.session.findFirst({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!session) throw new UnauthorizedException('Sesión expirada');

    const valid = await bcrypt.compare(refreshToken, session.refreshToken);
    if (!valid) throw new UnauthorizedException('Refresh token inválido');

    // 🔄 Rotación: eliminamos la sesión antes de crear una nueva
    await this.prisma.session.delete({ where: { id: session.id } });

    return this.generateTokens(
      user.id,
      user.email,
      session.userAgent ?? undefined,
      session.ip ?? undefined,
    );
  }

  async logout(userId: string) {
    // Cierra solo la sesión más reciente (dispositivo actual)
    const session = await this.prisma.session.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (session) {
      await this.prisma.session.delete({ where: { id: session.id } });
    }
    return { message: 'Sesión cerrada' };
  }

  async logoutAll(userId: string) {
    // Cierra TODAS las sesiones (todos los dispositivos)
    const result = await this.prisma.session.deleteMany({
      where: { userId },
    });
    return { message: 'Sesión cerrada', sessionsDeleted: result.count };
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateTokens(
    userId: string,
    email: string,
    userAgent?: string,
    ip?: string,
  ) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken: refreshHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: userAgent?.slice(0, 200) ?? null,
        ip: ip?.slice(0, 45) ?? null,
      },
    });

    return { accessToken, refreshToken };
  }

  private sanitize(user: any) {
    const { passwordHash, twoFactorSecret, backupCodes, ...rest } = user;
    return rest;
  }
}