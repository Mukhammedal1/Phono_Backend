import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from '../file/file.service';

@Injectable()
export class ImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async create(createImageDto: CreateImageDto, files: Express.Multer.File[]) {
    const phone = await this.prisma.phone.findUnique({
      where: { id: createImageDto.phoneId },
    });

    if (!phone) {
      throw new NotFoundException('Phone topilmadi');
    }

    const urls = await this.fileService.saveMultipleFiles(files);

    const imageData = urls.map((url) => ({
      url,
      phoneId: createImageDto.phoneId,
    }));

    await this.prisma.image.createMany({
      data: imageData,
    });

    return imageData;
  }

  async findAll() {
    return await this.prisma.image.findMany({ include: { Phone: true } });
  }

  async findOne(id: number) {
    const result = await this.prisma.image.findUnique({ where: { id } });
    if (!result) {
      throw new Error('Rasm Topilmadi');
    }
    return result;
  }

  // async findImagesByPhoneId(id: number) {
  //   const result = await this.prisma.image.findMany({ where: { phoneId: id } });
  //   if (!result) {
  //     throw new Error('Rasm Topilmadi');
  //   }
  //   return result;
  // }

  async update(id: number, updateImageDto: UpdateImageDto) {
    return await this.prisma.color.update({
      where: { id },
      data: { ...updateImageDto },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.image.delete({ where: { id } });
    return { message: "Rasm juda ham chiryli O'chirildi" };
  }
}
