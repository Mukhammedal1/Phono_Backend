import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateImageDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  phoneId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
}
