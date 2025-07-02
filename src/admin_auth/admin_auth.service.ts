import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import { SignInAdminDto } from './dto/sign-in.dto';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Admin } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService,
  ) {}

  async getTokens(admin: Admin) {
    const payload = {
      id: admin.id,
      is_creator: admin.is_creator,
      email: admin.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ADMIN_ACCESS_KEY,
        expiresIn: process.env.access_time,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.ADMIN_REFRESH_KEY,
        expiresIn: process.env.refresh_time,
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async signIn(signInDto: SignInAdminDto, res: Response) {
    const admin = await this.adminService.findOneByEmail(signInDto.email);
    if (!admin) {
      throw new UnauthorizedException("Email yoki parol noto'g'ri");
    }

    const now = new Date();

    if (admin.locked_until && admin.locked_until > now) {
      const waitTime = Math.ceil(
        (admin.locked_until.getTime() - now.getTime()) / 1000,
      );
      const minutes = Math.floor(waitTime / 60);
      const seconds = waitTime % 60;

      throw new ConflictException(
        `Admin bloklangan. Qayta urinib ko'ring: ${minutes}:${seconds.toString().padStart(2, '0')} daqiqadan so'ng`,
      );
    }

    const isvalidPassword = await bcrypt.compare(
      signInDto.password,
      admin.hashed_password,
    );

    if (!isvalidPassword) {
      const maxAttempts = 5;
      const lockMinutes = 5;

      const newAttempts = admin.login_attempts + 1;
      const isLocked = newAttempts >= maxAttempts;

      await this.prisma.admin.update({
        where: { id: admin.id },
        data: {
          login_attempts: newAttempts,
          locked_until: isLocked
            ? new Date(now.getTime() + lockMinutes * 60000)
            : null,
        },
      });

      throw new UnauthorizedException(
        isLocked
          ? `Ko'p noto'g'ri urinish. Admin ${lockMinutes} daqiqaga bloklandi.`
          : `Email yoki parol noto'g'ri. Urinish: ${newAttempts} / ${maxAttempts}`,
      );
    }

    if (!admin.is_active) {
      throw new UnauthorizedException('Admin active emas');
    }
    const tokens = await this.getTokens(admin);

    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);
    const updatedAdmin = await this.adminService.updateRefreshToken(
      admin.id,
      hashed_refresh_token,
    );
    if (!updatedAdmin) {
      throw new InternalServerErrorException('Tokenni saqlashda xatolik');
    }
    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: Number(process.env.refresh_token_ms),
      httpOnly: true,
    });
    const response = {
      message: 'Login is successfully',
      adminId: admin.id,
      access_token: tokens.access_token,
    };
    return response;
  }

  async signOut(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new NotFoundException('Refresh token not found');
    }
    const adminData = await this.jwtService.verify(refreshToken, {
      secret: process.env.ADMIN_REFRESH_TOKEN_KEY,
    });
    if (!adminData) {
      throw new ForbiddenException('Admin not verified');
    }
    const hashed_refresh_token = null;
    await this.adminService.updateRefreshToken(
      adminData.id,
      hashed_refresh_token,
    );
    res.clearCookie('refresh_token');
    const response = {
      message: 'Logout is successfully',
    };
    return response;
  }

  async refreshToken(adminId: number, refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new NotFoundException('Refresh token not found');
    }
    const decodedToken = await this.jwtService.decode(refreshToken);
    if (adminId !== decodedToken['id']) {
      throw new BadRequestException('Ruxsat etilmagan foydalanuvchi');
    }
    const admin = await this.adminService.findOne(adminId);
    if (!admin || !admin.refresh_token) {
      throw new BadRequestException('Admin not found');
    }
    const tokenMatch = await bcrypt.compare(refreshToken, admin.refresh_token);
    if (!tokenMatch) {
      throw new ForbiddenException('Tokens not matched');
    }
    const tokens = await this.getTokens(admin);

    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);
    await this.adminService.updateRefreshToken(admin.id, hashed_refresh_token);

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: Number(process.env.tokenTime), // 15 * 24 * 60 * 60 * 1000
      httpOnly: true,
    });
    console.log(process.env.tokenTime);
    const response = {
      message: 'access token refreshed',
      admin: admin.id,
      access_token: tokens.access_token,
    };
    return response;
  }
}
