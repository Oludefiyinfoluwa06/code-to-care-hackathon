import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class AvailableDaysAndTimeDto {
  @IsNotEmpty()
  day: string;

  @IsNotEmpty()
  time: string;
}

export class CreateDoctorDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AvailableDaysAndTimeDto)
  availableDaysAndTime: AvailableDaysAndTimeDto[];
}
