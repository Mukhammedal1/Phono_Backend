import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber } from "class-validator";

export class CreateArchiveDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    phoneId: number;

}
