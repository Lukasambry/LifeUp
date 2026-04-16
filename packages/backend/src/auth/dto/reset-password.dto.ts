import { IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @Matches(/(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/, {
    message:
      'password must contain at least one letter, one number, and one symbol',
  })
  newPassword: string;
}
