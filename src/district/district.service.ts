import { Injectable } from '@nestjs/common';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DistrictService {
  constructor(private readonly primsa: PrismaService) { }
  async create(createDistrictDto: CreateDistrictDto) {
    return await this.primsa.district.create({ data: createDistrictDto });;
  }

  async findAll() {
    return await this.primsa.district.findMany({
      include: {
        Region: true,
      },
    });
  }

  async findOne(id: number) {
    const result = await this.primsa.district.findUnique({
      where: { id },
      include: {
        Region: true,
      },
    });
    if (!result) {
      throw new Error('District not found');
    }
    return result;
  }

  async update(id: number, updateDistrictDto: UpdateDistrictDto) {
    const result = await this.primsa.district.update({
      where: { id },
      data: { ...updateDistrictDto },
    });
    if (!result) {
      throw new Error('District not found');
    }
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.primsa.district.delete({ where: { id } });
    return { message: 'District deleted successfully' };
  }
}
