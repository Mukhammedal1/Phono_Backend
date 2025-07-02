import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArchiveDto } from './dto/create-archive.dto';
import { UpdateArchiveDto } from './dto/update-archive.dto';
import { PrismaService } from '../prisma/prisma.service';
import { convertBigIntToString } from '../common/utils/convertBigint.util';

@Injectable()
export class ArchivesService {
  constructor(private readonly prisma: PrismaService ) {}
  async create(createArchiveDto: CreateArchiveDto) {
    const archive = await this.prisma.archives.create({ data: createArchiveDto});
    return convertBigIntToString(archive);
  }

  async findAll() {
    const data = await this.prisma.archives.findMany({
      include: {
        Phone: true,
      },
    });

    return convertBigIntToString(data);
  }

  async findOne(id: number) {
    const result = await this.prisma.archives.findUnique({
      where: { id },
      include: {
        Phone: true,
      },
    })
    if(!result) {
      throw new NotFoundException('Archives not found');
    }
    return convertBigIntToString(result);
  }

  async update(id: number, updateArchiveDto: UpdateArchiveDto) {
    const result = await this.prisma.archives.update({
      where: { id },
      data: {...updateArchiveDto},
    });
    if (!result) {
      throw new Error('Archives not found')
    }
    return convertBigIntToString(result);
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.prisma.archives.delete({
      where: { id }
    })
    return { message: 'Archives deleted successfully '};
  }
}
