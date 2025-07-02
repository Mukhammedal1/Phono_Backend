import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createBrandDto: CreateBrandDto) {
    return this.prisma.brand.create({ data: createBrandDto });
  }

  async findAll() {
    return await this.prisma.brand.findMany({ include: { Models: true } });
  }

  async findOne(id: number) {
    const result = await this.prisma.brand.findUnique({
      where: {id},
      include: { Models: true}
    })
    if (!result) {
      throw new Error('Brand not found');
    }
    return result;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    return await this.prisma.brand.update({
      where: {id},
      data: { ...updateBrandDto },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.brand.delete({ where: { id } });
    return { message: 'Brand deleted successfully' };
  }
}