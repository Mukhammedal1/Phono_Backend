import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PaymentType } from '../../../generated/prisma';

export class CreatePaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: PaymentType;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  paid_date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
