import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";

export class CreatePhoneNumberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber("UZ")
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}