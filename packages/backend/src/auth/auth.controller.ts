import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  GoogleAuthDto,
  AppleAuthDto,
  MagicLinkRequestDto,
  MagicLinkVerifyDto,
} from './dto/index';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser('id') userId: string, @Body() body: RefreshTokenDto) {
    return this.auth.logout(userId, body.refreshToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: RefreshTokenDto) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('forgot-password')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.newPassword);
  }

  @Post('google')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  loginWithGoogle(@Body() dto: GoogleAuthDto) {
    return this.auth.loginWithGoogle(dto.idToken);
  }

  @Post('apple')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  loginWithApple(@Body() dto: AppleAuthDto) {
    return this.auth.loginWithApple(dto.identityToken, {
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
  }

  @Post('magic-link/request')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  requestMagicLink(@Body() dto: MagicLinkRequestDto) {
    return this.auth.requestMagicLink(dto.email);
  }

  @Post('magic-link/verify')
  @HttpCode(HttpStatus.OK)
  verifyMagicLink(@Body() dto: MagicLinkVerifyDto) {
    return this.auth.verifyMagicLink(dto.token);
  }

  @Get('google/mobile')
  async googleMobileInit(
    @Query('sessionId') sessionId: string,
    @Res() res: Response,
  ) {
    const url = await this.auth.buildGoogleOAuthUrl(sessionId);
    res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') sessionId: string,
    @Res() res: Response,
  ) {
    await this.auth.handleGoogleCallback(code, sessionId);
    res.send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0F0F1A;color:#fff">
        <h2>Connexion réussie !</h2>
        <p style="color:#8B8BA7">Tu peux fermer cette fenêtre et retourner dans l'application.</p>
      </body></html>
    `);
  }

  @Get('google/status/:sessionId')
  getGoogleAuthStatus(@Param('sessionId') sessionId: string) {
    return this.auth.getGoogleAuthStatus(sessionId);
  }
}
