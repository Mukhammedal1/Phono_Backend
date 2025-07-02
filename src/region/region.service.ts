import { Injectable } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegionService {
  constructor(private readonly primsa: PrismaService) { }
  async create(createRegionDto: CreateRegionDto) {
    return this.primsa.region.create({ data: createRegionDto });
  }

  async findAll() {
    return await this.primsa.region.findMany({ include: { Districts: true } });
  }

  async findOne(id: number) {
    const result = await this.primsa.region.findUnique({ where: { id }, include: { Districts: true } });
    if (!result) {
      throw new Error('Region not found');
    }
    return result;
  }

  async update(id: number, updateRegionDto: UpdateRegionDto) {
    return await this.primsa.region.update({
      where: { id },
      data: { ...updateRegionDto },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.primsa.region.delete({ where: { id } });
    return { message: 'Region deleted successfully' };
  }
}
