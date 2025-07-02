import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";


export class UpdateMainPhoneDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  phoneId: number;
}