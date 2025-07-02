import { Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCurrencyDto: CreateCurrencyDto) {
    return this.prisma.currency.create({ data: createCurrencyDto });
  }

  async findAll() {
    return await this.prisma.currency.findMany();
  }

  async findOne(id: number) {
    const result = await this.prisma.currency.findUnique({
      where: {id},
    })
    if(!result){
      throw new Error('Currency not found');
    }
    return result;
  }

  async update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
    const result = await this.prisma.currency.update({
      where: {id},
      data: { ...updateCurrencyDto },
    });
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.currency.delete({ where: { id }});
    return { message: 'Currency deleted successfully'};
  }
}
