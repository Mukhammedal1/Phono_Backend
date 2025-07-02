import { IsOptional, IsString, IsNumber, MinLength, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsEmail, ValidateIf, IsPhoneNumber, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Either email or phone number is required' })
  @IsEmail()
  @ValidateIf((o) => !o.phoneNumber)
  email?: string;

  @ApiProperty()
  @IsPhoneNumber('UZ')
  @ValidateIf((o) => !o.email)
  phoneNumber?: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  activation_link?: string;
}

