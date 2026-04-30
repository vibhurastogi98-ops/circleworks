import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '@/prisma/prisma.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  VerifyEmailDto,
  MfaEnableDto,
  MfaVerifyDto,
  MfaDisableDto,
} from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword, firstName, lastName } = registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
      },
    });

    // Send verification email (mock)
    // await this.emailService.sendVerificationEmail(user);

    return {
      id: user.id,
      email: user.email,
      message: 'Registration successful. Check your email for verification link.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, mfaCode } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.hashedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.mfaEnabled && !mfaCode) {
      return { mfaRequired: true };
    }

    if (user.mfaEnabled && mfaCode) {
      const isValidCode = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaCode,
      });

      if (!isValidCode) {
        throw new UnauthorizedException('Invalid MFA code');
      }
    }

    const tokens = await this.generateTokens(user);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return tokens;
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date() || storedToken.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logout successful' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If email exists, a reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      { expiresIn: '1h' },
    );

    // Send reset email (mock)
    // await this.emailService.sendPasswordResetEmail(user, resetToken);

    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid token');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: {
          hashedPassword,
          // Invalidate all refresh tokens
        },
      });

      // Revoke all refresh tokens
      await this.prisma.refreshToken.updateMany({
        where: { userId: payload.sub },
        data: { revokedAt: new Date() },
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'email-verify') {
        throw new UnauthorizedException('Invalid token');
      }

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { isEmailVerified: true },
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async enableMfa(userId: string, mfaEnableDto: MfaEnableDto) {
    const { password } = mfaEnableDto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const secret = speakeasy.generateSecret({
      name: `CircleWorks (${user.email})`,
      issuer: 'CircleWorks',
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes: this.generateBackupCodes(),
    };
  }

  async verifyMfa(userId: string, mfaVerifyDto: MfaVerifyDto) {
    const { code, secret } = mfaVerifyDto;

    const isValidCode = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
    });

    if (!isValidCode) {
      throw new BadRequestException('Invalid MFA code');
    }

    const backupCodes = this.generateBackupCodes();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: secret,
        mfaBackupCodes: JSON.stringify(backupCodes),
      },
    });

    return { message: 'MFA enabled successfully', backupCodes };
  }

  async disableMfa(userId: string, mfaDisableDto: MfaDisableDto) {
    const { password } = mfaDisableDto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: null,
      },
    });

    return { message: 'MFA disabled successfully' };
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
    });

    const refreshTokenExpiresIn = this.configService.get('JWT_REFRESH_EXPIRATION') || '7d';
    const refreshTokenString = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiresIn,
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer',
    };
  }

  private generateBackupCodes(count = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  }
}
