import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBrandDto } from './create-brand.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBrandDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
}
