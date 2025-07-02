
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  districtId?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  languageId?: number;

  @ApiProperty({ required: false })
  profileImageUrl?: string;
}
