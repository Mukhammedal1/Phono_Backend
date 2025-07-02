import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class SignInDto {
  @ApiProperty({required: false})
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}

