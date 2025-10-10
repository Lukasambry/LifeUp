/**
 * Application Layer - Auth Response DTO
 * Defines the structure of authentication response
 */

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: {
      id: string;
      name: string;
      type: string;
    };
    isPremium: boolean;
    isActive: boolean;
  };
}
