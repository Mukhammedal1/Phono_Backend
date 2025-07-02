import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: "Kamida 3 ta harfdan iborat bo'lishi kerak" })
  firstname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: "Kamida 3 ta harfdan iborat bo'lishi kerak" })
  lastname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+998\d{9}$/, {
    message: "Telefon raqam +998901234567 formatda bo'lishi kerak",
  })
  phone_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: "Email noto'g'ri formatda" })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(15, {
    message: "Parol ko'pi bilan 15 ta belgidan iborat bo'lishi kerak",
  })
  @MinLength(5, { message: "Parol kamida 5 ta belgidan iborat bo'lishi kerak" })
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_creator?: boolean;
}
