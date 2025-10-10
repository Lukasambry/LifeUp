/**
 * Infrastructure Layer - JWT Service
 * Handles JWT token generation and validation
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  roleId: string;
  roleType: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtService implements OnModuleInit {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(private readonly jwtService: NestJwtService) {
    // Validate required environment variables at construction
    this.jwtSecret = this.getRequiredEnvVar('JWT_SECRET');
    this.jwtRefreshSecret = this.getRequiredEnvVar('JWT_REFRESH_SECRET');
  }

  onModuleInit() {
    // Double-check secrets are set on module initialization
    if (!this.jwtSecret || !this.jwtRefreshSecret) {
      throw new Error(
        'FATAL: JWT secrets not configured. Application cannot start.',
      );
    }
  }

  private getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(
        `FATAL: Required environment variable ${name} is not set. ` +
          `Please set it in your .env file or environment configuration.`,
      );
    }
    return value;
  }

  generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: '15m', // 15 minutes
    });
  }

  generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtRefreshSecret,
      expiresIn: '7d', // 7 days
    });
  }

  generateTokenPair(
    payload: Omit<JwtPayload, 'iat' | 'exp'>,
  ): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.jwtSecret,
    });
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.jwtRefreshSecret,
    });
  }

  decodeToken(token: string): JwtPayload | null {
    return this.jwtService.decode(token) as JwtPayload | null;
  }
}
