import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { Type } from 'class-transformer';

export class VerifyDto {
  @ApiProperty()
  @IsPhoneNumber("UZ")
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp:string;
}
