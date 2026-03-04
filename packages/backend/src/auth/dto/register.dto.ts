import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'username must contain only letters, numbers, underscores, or hyphens',
  })
  username: string;

  @IsString()
  @MinLength(12, { message: 'password must be at least 12 characters' })
  @Matches(/(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/, {
    message:
      'password must contain at least one letter, one number, and one symbol',
  })
  password: string;
}
