import { ApiProperty } from '@nestjs/swagger';
import {IsPhoneNumber } from 'class-validator';

export class PhoneDto {
  @ApiProperty()
  @IsPhoneNumber("UZ")
  phone: string;
}
