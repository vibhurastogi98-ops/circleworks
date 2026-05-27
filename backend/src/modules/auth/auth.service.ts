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
  ChangePasswordDto,
  RefreshTokenDto,
  VerifyEmailDto,
  MfaEnableDto,
  MfaVerifyDto,
  MfaDisableDto,
} from './dtos/auth.dto';
import { SessionAlertService } from './session-alert.service';
import { DeviceInfo, SessionLimitAction, SessionService } from './session.service';

interface LoginContext {
  deviceInfo: DeviceInfo;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionService: SessionService,
    private sessionAlertService: SessionAlertService,
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

  async login(loginDto: LoginDto, context: LoginContext) {
    const { email, password, mfaCode, rememberMe, sessionLimitAction } = loginDto;

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

    let tokens;
    try {
      tokens = await this.generateTokens(user, {
        rememberMe,
        deviceInfo: context.deviceInfo,
        limitAction: sessionLimitAction,
      });
    } catch (error: any) {
      if (error?.code === 'SESSION_LIMIT_REACHED') {
        throw new ConflictException({
          error: 'session_limit_reached',
          message: 'Session limit reached',
          maxSessions: error.maxSessions,
          options: error.options,
        });
      }
      throw error;
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    void this.sessionAlertService.sendNewDeviceLoginAlertEmail(user, context.deviceInfo);

    return tokens;
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const rotated = await this.sessionService.rotateRefreshToken({ refreshToken });
    if (!rotated) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: rotated.session.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.generateAccessToken(user);
    return {
      accessToken,
      refreshToken: rotated.refreshToken,
      refreshTokenMaxAge: rotated.ttlSeconds,
      session: this.serializeSession(rotated.session),
      expiresIn: 900,
      tokenType: 'Bearer',
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.sessionService.revokeRefreshToken(refreshToken);
    }

    return { message: 'Logout successful' };
  }

  async listSessions(userId: string) {
    const sessions = await this.sessionService.listSessions(userId);
    return { sessions: sessions.map((session) => this.serializeSession(session)) };
  }

  async revokeSession(userId: string, sessionId: string) {
    const revoked = await this.sessionService.revokeSession(userId, sessionId);
    return { success: revoked };
  }

  async revokeOtherSessions(userId: string, currentSessionId?: string) {
    await this.sessionService.revokeOtherUserSessions(userId, currentSessionId);
    return { success: true };
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
      await this.sessionService.revokeAllUserSessions(payload.sub);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true },
      });
      if (user) {
        void this.sessionAlertService.sendPasswordChangedRevocationEmail(user);
      }

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedPassword) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
    await this.sessionService.revokeAllUserSessions(userId);

    void this.sessionAlertService.sendPasswordChangedRevocationEmail({
      id: user.id,
      email: user.email,
    });

    return { message: 'Password changed — all other sessions signed out' };
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

  private async generateTokens(
    user: any,
    options: {
      rememberMe?: boolean;
      deviceInfo: DeviceInfo;
      limitAction?: SessionLimitAction;
    },
  ) {
    const accessToken = this.generateAccessToken(user);
    const { refreshToken, session, ttlSeconds } = await this.sessionService.createSession({
      userId: user.id,
      rememberMe: options.rememberMe,
      deviceInfo: options.deviceInfo,
      limitAction: options.limitAction,
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenMaxAge: ttlSeconds,
      session: this.serializeSession(session),
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer',
    };
  }

  private generateAccessToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
    });
  }

  private serializeSession(session: any) {
    return {
      id: session.sessionId,
      deviceId: session.deviceId,
      createdAt: session.createdAt,
      lastActive: session.lastActive,
      expiresAt: session.expiresAt,
      deviceInfo: session.deviceInfo,
      rememberMe: session.rememberMe,
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
