import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRegionDto } from './create-region.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRegionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
