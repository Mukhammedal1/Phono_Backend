import { Injectable } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  constructor(private readonly primsa: PrismaService) { }
  async create(createEmailDto: CreateEmailDto) {
    return await this.primsa.email.create({ data: createEmailDto });
  }

  async findAll() {
    return await this.primsa.email.findMany({
      include: {
        User: true,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} email`;
  }

  update(id: number, updateEmailDto: UpdateEmailDto) {
    return `This action updates a #${id} email`;
  }

  remove(id: number) {
    return `This action removes a #${id} email`;
  }
}
