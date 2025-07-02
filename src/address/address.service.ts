import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createAddressDto: CreateAddressDto) {
    return await this.prisma.address.create({ data: createAddressDto });
  }

  async findAll() {
    return await this.prisma.address.findMany({
      include: {
        User: true,
      },
    });
  }

  async findOne(id: number) {
    const result = await this.prisma.address.findUnique({
      where: { id },
      include: {
        User: true,
      },
    });
    if (!result) {
      throw new Error('Address not found');
    }
    return result;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto) {
    await this.findOne(id);
    const result = await this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
    });
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.address.delete({ where: { id } });
    return { message: 'Address deleted successfully' };
  }
}
