import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}
  async create(createAdminDto: CreateAdminDto) {
    const { password, email, image, ...data } = createAdminDto;

    const imageUrl = image || null;

    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (admin) {
      throw new BadRequestException('Bunday admin mavjud');
    }
    const admin2 = await this.prisma.admin.findUnique({
      where: { phone_number: data.phone_number },
    });
    if (admin2) {
      throw new BadRequestException('Bunday telefon raqamli admin mavjud');
    }
    const hashed_password = await bcrypt.hash(password, 7);

    const activation_link = uuid.v4();

    const newAdmin = await this.prisma.admin.create({
      data: {
        ...data,
        hashed_password,
        email,
        image: imageUrl,
        activation_link,
      },
    });

    try {
      await this.mailService.sendMailAdmin(newAdmin, createAdminDto.email);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Emailga xat yuborishda xatolik');
    }

    return {
      message:
        'Admin yaratildi, akkauntni faollashtirish uchun emailga xabar yuborildi',
      newAdmin,
    };
  }

  async findAll() {
    return await this.prisma.admin.findMany();
  }

  findOneByEmail(email: string) {
    return this.prisma.admin.findUnique({ where: { email } });
  }

  async updateRefreshToken(id: number, hashed_refresh_token: string | null) {
    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: { refresh_token: hashed_refresh_token, last_login: new Date() },
    });
    return updatedAdmin;
  }

  async findOne(id: number) {
    const result = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!result) {
      throw new Error('Admin not found');
    }
    return result;
  }

  async activate(link: string) {
    if (!link) {
      throw new NotFoundException('Activation link not found');
    }

    const admin = await this.prisma.admin.findUnique({
      where: {
        activation_link: link,
        is_active: false,
      },
    });

    if (!admin) {
      throw new BadRequestException('Admin already activated');
    }

    const updatedadmin = await this.prisma.admin.update({
      where: { id: admin.id },
      data: { is_active: true },
    });

    const response = {
      message: 'Admin activated successfully',
      isActive: updatedadmin.is_active,
    };
    return response;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    await this.findOne(id);
    const result = await this.prisma.admin.update({
      where: { id },
      data: updateAdminDto,
    });
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.admin.update({
      where: { id },
      data: { is_deleted: true },
    });
    return { message: 'Admin deleted successfully' };
  }
}
