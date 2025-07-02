import { Injectable } from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ColorService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createColorDto: CreateColorDto) {
    return await this.prisma.color.create({ data: createColorDto });
  }

  async findAll() {
    return await this.prisma.color.findMany();
  }

  async update(id: number, updateColorDto: UpdateColorDto) {
    return await this.prisma.color.update({
      where: { id },
      data: updateColorDto,
    });
  }

  async remove(id: number) {
    await this.prisma.color.delete({ where: { id } });
  }
}
