import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    return await this.prisma.payment.create({ data: createPaymentDto });
  }

  async findAll() {
    return await this.prisma.payment.findMany({
      include: {
        User: true,
      },
    });
  }

  async findOne(id: number) {
    const result = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        User: true,
      },
    });
    if (!result) {
      throw new Error('Payment not found');
    }
    return result;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    await this.findOne(id);
    const result = await this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
    });
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.payment.delete({ where: { id } });
    return { message: 'Payment deleted successfully' };
  }
}
