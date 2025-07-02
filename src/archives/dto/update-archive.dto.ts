import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber } from "class-validator";

export class UpdateArchiveDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    phoneId: number;

    @ApiProperty()
    @IsDate()
    @IsNotEmpty()
    archivedAt: Date;
}
