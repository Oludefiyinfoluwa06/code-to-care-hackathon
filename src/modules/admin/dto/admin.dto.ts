import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Min } from 'class-validator';

export class AdminDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsNotEmpty()
  @Min(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
