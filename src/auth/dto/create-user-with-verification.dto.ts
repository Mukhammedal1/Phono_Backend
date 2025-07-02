import { IsNotEmpty, ValidateNested } from "class-validator";
import { CreateUserDto } from "../../user/dto/create-user.dto";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserWithOtpDto {
  

  @ApiProperty()
  @IsNotEmpty()
  otp: string;
}
