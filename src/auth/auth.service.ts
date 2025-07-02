import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { SignInDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../common/types/tokens.type';
import { JwtPayload } from '../common/types/JwtPayload';
import { ResponseFields } from '../common/types/response.type';
import { Response } from 'express';
import { decode, encode } from '../helpers/crypto';
import { AddMinutesToDate } from '../helpers/addMinutes';
import * as otpGenerator from 'otp-generator';
import { SmsService } from '../sms/sms.service';
import * as uuid from 'uuid';
import { PhoneDto } from './dto/phone-user.dto';
import { VerifyDto } from './dto/verify-otp.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    if (createUserDto.phoneNumber) {
      await this.userService.create({
        ...createUserDto,
        isActive: false,
      });
      return await this.newOtp({ phone: createUserDto.phoneNumber });
    }
    if (createUserDto.email) {
      const activation_link = uuid.v4();

      const user = await this.userService.create({
        ...createUserDto,
        isActive: false,
        activation_link,
      });

      try {
        await this.mailService.sendMail(user, createUserDto.email);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(
          'Emailga xat yuborishda xatolik',
        );
      }
      const response = {
        message:
          "Tabriklayman tizimga qo'shildingiz. Akkauntni faollashtirish uchun emailga xat yuborildi",
        user,
      };
      return response;
    }

    if (!createUserDto.phoneNumber && createUserDto.email) {
      return this.userService.create(createUserDto);
    }

    throw new BadRequestException(
      'Phone number or email is required for signup.',
    );
  }

  async signIn(signInDto: SignInDto, res: Response): Promise<ResponseFields> {
    const { email, phoneNumber, password } = signInDto;

    const user = await this.userService.findUserByEmailOrPhone(
      email!,
      phoneNumber!,
    );
    if (!user) {
      throw new ConflictException('Invalid credentials');
    }

    const now = new Date();

    if (user.lockedUntil && user.lockedUntil > now) {
      const waitTime = Math.ceil(
        (user.lockedUntil.getTime() - now.getTime()) / 1000,
      );
      const minutes = Math.floor(waitTime / 60);
      const seconds = waitTime % 60;

      throw new ConflictException(
        `Account locked. Try again after: ${minutes}:${seconds.toString().padStart(2, '0')} minutes`,
      );
    }

    if (!user.isActive) {
      throw new ConflictException('User is not active');
    }

    const matchPass = await bcrypt.compare(password, user.password);

    if (!matchPass) {
      const maxAttempts = 5;
      const lockMinutes = 5;

      const newAttempts = user.loginAttempts + 1;
      const isLocked = newAttempts >= maxAttempts;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: isLocked
            ? new Date(now.getTime() + lockMinutes * 60000)
            : null,
        },
      });

      throw new ConflictException(
        isLocked
          ? `Too many failed attempts. Account locked for ${lockMinutes} minutes.`
          : `Invalid credentials. Attempt ${newAttempts} of ${maxAttempts}`,
      );
    }

    if (!user.isActive) {
      throw new ConflictException('User is not active');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    const payload = {
      id: user.id,
      email: user.mainEmail?.email,
      phoneNumber: user.mainPhone?.phone,
    };

    const tokens = await this.getTokens(payload);

    const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 11);
    const updatedUser = await this.userService.updateRefreshToken(
      user.id,
      hashedRefreshToken,
    );

    if (!updatedUser)
      throw new InternalServerErrorException('Cannot save token');

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: +process.env.refresh_token_ms!,
      httpOnly: true,
    });

    const response = {
      id: user.id,
      access_token: tokens.access_token,
    };

    return response;
  }

  async signOut(userId: number, res: Response): Promise<boolean> {
    const user = await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedToken: {
          not: null,
        },
      },
      data: {
        hashedToken: null,
      },
    });

    if (user.count === 0) {
      throw new ForbiddenException('No active session found');
    }

    res.clearCookie('refresh_token');
    return true;
  }

  async refreshToken(
    userId: number,
    refreshToken: string,
    res: Response,
  ): Promise<ResponseFields> {
    const decodedToken = await this.jwtService.decode(refreshToken);

    const isValid = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.refresh_key,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid refresh token');
    }

    if (userId != decodedToken['id']) {
      throw new BadRequestException('Invalid refresh token');
    }

    const user = await this.userService.findOne(userId);

    if (!user || !user.hashedToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    const tokenMatch = await bcrypt.compare(refreshToken, user.hashedToken);

    if (!tokenMatch) throw new ForbiddenException('Forbidden');

    const payload = {
      id: user.id,
      email: user.mainEmail?.email,
      phoneNumber: user.mainPhone?.phone,
    };

    const tokens = await this.getTokens(payload);

    const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 11);
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: +process.env.refresh_token_ms!,
      httpOnly: true,
    });

    const response = {
      id: user.id,
      access_token: tokens.access_token,
    };

    return response;
  }

  async getTokens(payload: JwtPayload): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.access_key,
        expiresIn: process.env.access_time,
      }),

      this.jwtService.signAsync(payload, {
        secret: process.env.refresh_key,
        expiresIn: process.env.refresh_time,
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  // ============================== OTP ==============================
  async newOtp(phoneUserDto: PhoneDto) {
    const phone = phoneUserDto.phone;

    const otp = otpGenerator.generate(5, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const response = await this.smsService.sendSMS(phone, otp);
    if (!response || response.status !== 200) {
      throw new ServiceUnavailableException('Failed to send OTP.');
    }

    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 1);

    await this.prisma.otp.deleteMany({ where: { phone_number: phone } });

    const details = { timestamp: now, phone_number: phone };

    const encodedKey = await encode(JSON.stringify(details));

    const otpRecord = await this.prisma.otp.create({
      data: {
        otp,
        phone_number: phone,
        expiration_time,
        verificationKey: encodedKey,
        verified: false,
      },
    });

    return {
      message: `OTP sent to ****${phone.slice(-4)}, please verify it in 1 minute.`,
    };
  }

  async verifyOtp(verifyDto: VerifyDto) {
    const { otp, phone } = verifyDto;
    const current_time = new Date();

    await this.cleanupUnverifiedUsers();

    const otpRecord = await this.prisma.otp.findUnique({
      where: { phone_number: phone },
    });

    if (!otpRecord) {
      throw new NotFoundException('OTP not found');
    }

    if (otpRecord.verified) {
      throw new BadRequestException('OTP already used');
    }

    if (otpRecord.expiration_time < current_time) {
      throw new BadRequestException('OTP expired');
    }

    if (otpRecord.otp !== otp) {
      throw new BadRequestException('OTP mismatch');
    }

    await this.prisma.$transaction([
      this.prisma.otp.update({
        where: { phone_number: phone },
        data: { verified: true },
      }),
      this.prisma.user.updateMany({
        where: {
          isActive: false,
          mainPhone: { phone },
        },
        data: {
          isActive: true,
        },
      }),
    ]);

    return {
      message: '✅ Phone number verified and user activated.',
    };
  }

  async cleanupUnverifiedUsers() {
    const now = new Date();

    const expiredOtps = await this.prisma.otp.findMany({
      where: {
        expiration_time: { lt: now },
        verified: false,
      },
      select: { phone_number: true },
    });

    for (const { phone_number } of expiredOtps) {
      await this.prisma.$transaction([
        this.prisma.user.deleteMany({
          where: {
            isActive: false,
            mainPhone: { phone: phone_number },
          },
        }),
        this.prisma.otp.delete({
          where: { phone_number },
        }),
      ]);
    }
  }
}
