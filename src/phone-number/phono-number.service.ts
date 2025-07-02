import { Injectable } from '@nestjs/common';
import { UpdatePhonoNumberDto } from './dto/update-phono-number.dto';
import { CreatePhoneNumberDto } from './dto/create-phono-number.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhonoNumberService {
  constructor(private readonly primsa: PrismaService) { }
  async create(createPhonoNumberDto: CreatePhoneNumberDto) {
    return await this.primsa.phoneNumber.create({ data: createPhonoNumberDto });
  }

  async findAll() {
    return await this.primsa.phoneNumber.findMany({
      include: {
        User: true,
      }
    });
  }

  async findPhoneNumbersByUserId(id:number) {
    return await this.primsa.phoneNumber.findMany({
      include: {
        User: true,
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} phonoNumber`;
  }

  update(id: number, updatePhonoNumberDto: UpdatePhonoNumberDto) {
    return `This action updates a #${id} phonoNumber`;
  }

  remove(id: number) {
    return `This action removes a #${id} phonoNumber`;
  }
}
