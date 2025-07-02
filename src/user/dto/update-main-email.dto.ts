import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";


export class UpdateMainEmailDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  emailId: number;
}