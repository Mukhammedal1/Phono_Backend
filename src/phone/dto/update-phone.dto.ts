import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePhoneDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  year: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ram: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rom: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  box_with_document: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  is_new: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  is_negotiable: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  currencyId: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  modelId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  regionId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  districtId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  brandId?: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  colorId: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  addressId: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  userId: number;
}
