import { Injectable } from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LanguageService {
  constructor(private readonly primsa: PrismaService) { }
  async create(createLanguageDto: CreateLanguageDto) {
    return await this.primsa.language.create({ data: createLanguageDto });
  }

  async findAll() {
    return await this.primsa.language.findMany({
    });
  }

  async findOne(id: number) {
    const result = await this.primsa.language.findUnique({ where: { id } });
    if (!result) {
      throw new Error('Language not found');
    }
    return result;
  }

  async update(id: number, updateLanguageDto: UpdateLanguageDto) {
    const result = await this.primsa.language.update({
      where: { id },
      data: { ...updateLanguageDto },
    });
    if (!result) {
      throw new Error('Language not found');
    }
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.primsa.language.delete({ where: { id } });
    return { message: 'Language deleted successfully' };
  }
}
