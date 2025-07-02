import { Injectable } from '@nestjs/common';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModelService {
  constructor( private readonly prisma:PrismaService) {}
  async create(createModelDto: CreateModelDto) {
    return await this.prisma.model.create({ data: createModelDto});
  }

  async findAll() {
    return await this.prisma.model.findMany({
      include: {
        Brand: true,
      },
    });
  }

  async findOne(id: number) {
    const result = await this.prisma.model.findUnique({
      where: {id},
      include: {
        Brand: true,
      },
    })
    if (!result) {
      throw new Error('Model not found');
    }
    return result;
  }

  async update(id: number, updateModelDto: UpdateModelDto) {
    const result = await this.prisma.model.update({
      where: {id},
      data: {...updateModelDto},
    });
    if (!result) {
      throw new Error('Model not found');
    }
    return result;
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.prisma.model.delete({
      where: { id }
    })
    return { message: 'Model deleted successfully' };
  }
}