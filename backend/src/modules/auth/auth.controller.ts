import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async logout(@Request() req: any, @Body() body: { refreshToken: string }) {
    return this.authService.logout(req.user.id, body.refreshToken);
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
}
