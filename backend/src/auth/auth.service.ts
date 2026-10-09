import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/email/email.service';
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
    private email: EmailService,
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

    // 📧 Enviar email de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        email: user.email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.email.sendVerificationEmail(
      user.email,
      verificationToken,
      user.displayName ?? user.username,
    );

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

    await this.prisma.session.delete({ where: { id: session.id } });

    return this.generateTokens(
      user.id,
      user.email,
      session.userAgent ?? undefined,
      session.ip ?? undefined,
    );
  }

  async logout(userId: string) {
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

  // 📧 VERIFICACIÓN DE EMAIL

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      throw new UnauthorizedException('Token inválido');
    }

    if (record.usedAt) {
      throw new UnauthorizedException('Token ya usado');
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Token caducado');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Email verificado correctamente ✅' };
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.emailVerified) {
      return { message: 'Tu email ya está verificado' };
    }

    await this.prisma.emailVerification.deleteMany({
      where: { userId, usedAt: null },
    });

    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailVerification.create({
      data: {
        userId,
        token,
        email: user.email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.email.sendVerificationEmail(
      user.email,
      token,
      user.displayName ?? user.username,
    );

    return { message: 'Email reenviado 📧' };
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
