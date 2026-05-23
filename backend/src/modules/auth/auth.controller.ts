import {
  Controller,
  Delete,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  Response,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: any,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.login(loginDto, {
      deviceInfo: this.resolveDeviceInfo(req),
    });
    this.setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenMaxAge);
    return this.withoutRefreshToken(result);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: any,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = refreshTokenDto.refreshToken || this.getCookie(req, 'refresh_token');
    const result = await this.authService.refresh({ refreshToken });
    this.setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenMaxAge);
    return this.withoutRefreshToken(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @Request() req: any,
    @Body() body: { refreshToken?: string },
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = body.refreshToken || this.getCookie(req, 'refresh_token');
    this.clearRefreshTokenCookie(res);
    return this.authService.logout(req.user.id, refreshToken);
  }

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  async listSessions(@Request() req: any) {
    return this.authService.listSessions(req.user.id);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async revokeSession(@Request() req: any, @Param('id') sessionId: string) {
    return this.authService.revokeSession(req.user.id, sessionId);
  }

  @Post('sessions/revoke-others')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async revokeOtherSessions(@Request() req: any, @Body() body: { currentSessionId?: string }) {
    return this.authService.revokeOtherSessions(req.user.id, body.currentSessionId);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('mfa/enable')
  @UseGuards(AuthGuard('jwt'))
  async enableMfa(@Request() req: any, @Body() mfaEnableDto: MfaEnableDto) {
    return this.authService.enableMfa(req.user.id, mfaEnableDto);
  }

  @Post('mfa/verify')
  @UseGuards(AuthGuard('jwt'))
  async verifyMfa(@Request() req: any, @Body() mfaVerifyDto: MfaVerifyDto) {
    return this.authService.verifyMfa(req.user.id, mfaVerifyDto);
  }

  @Post('mfa/disable')
  @UseGuards(AuthGuard('jwt'))
  async disableMfa(@Request() req: any, @Body() mfaDisableDto: MfaDisableDto) {
    return this.authService.disableMfa(req.user.id, mfaDisableDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Request() req: any) {
    return { user: req.user };
  }

  private setRefreshTokenCookie(res: ExpressResponse, refreshToken: string, maxAgeSeconds: number) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: maxAgeSeconds * 1000,
    });
  }

  private clearRefreshTokenCookie(res: ExpressResponse) {
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });
  }

  private withoutRefreshToken(result: any) {
    const { refreshToken, refreshTokenMaxAge, ...publicResult } = result;
    return publicResult;
  }

  private getCookie(req: any, name: string) {
    const cookieHeader = req.headers?.cookie as string | undefined;
    if (!cookieHeader) return undefined;

    return cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
      ?.slice(name.length + 1);
  }

  private resolveDeviceInfo(req: any) {
    const userAgent = String(req.headers?.['user-agent'] || 'Unknown device');
    const ip = String(req.headers?.['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || 'Unknown location')
      .split(',')[0]
      .trim();

    return {
      type: /mobile|iphone|android/i.test(userAgent) ? 'Mobile' : 'Desktop',
      browser: this.detectBrowser(userAgent),
      os: this.detectOs(userAgent),
      location: ip,
      userAgent,
    };
  }

  private detectBrowser(userAgent: string) {
    if (/edg/i.test(userAgent)) return 'Edge';
    if (/chrome|crios/i.test(userAgent)) return 'Chrome';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/firefox|fxios/i.test(userAgent)) return 'Firefox';
    return 'Unknown browser';
  }

  private detectOs(userAgent: string) {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/mac os|macintosh/i.test(userAgent)) return 'macOS';
    if (/iphone|ipad|ios/i.test(userAgent)) return 'iOS';
    if (/android/i.test(userAgent)) return 'Android';
    if (/linux/i.test(userAgent)) return 'Linux';
    return 'Unknown OS';
  }
}
