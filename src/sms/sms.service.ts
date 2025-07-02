import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { Token } from '../../generated/prisma';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class SmsService {
  constructor(private readonly prisma: PrismaService) { }
  async sendSMS(phone_number: string, otp: string) {
    const data = new FormData();
    data.append("mobile_phone", phone_number);
    data.append("message", `Assalamu alaykum, hurmatli foydalanuvchi, sizning "Phono" platformasidagi tasdiqlash kodingiz: ${otp}`);
    data.append("from", "4546");

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.SMS_SERVICE_URL,
      headers: {
        Authorization: `Bearer ${process.env.SMS_TOKEN}`
      },
      data: data
    };

    try {
      const response = await axios(config);
      return response;
    } catch (error) {
      console.log(error)
      return { status: 500 }
    }
  }


  // these methods are used to get and refresh token
  
  
  // async refreshToken(token: Token) {
  //   try {
  //     const expire = JSON.parse(atob(token.token.split(".")[1])).exp * 1000;
  //     const currentTime = new Date().getTime();

  //     if (expire <= currentTime) {
  //       const refresh = await axios.patch(
  //         "https://notify.eskiz.uz/api/auth/refresh",
  //         {},
  //         { headers: { Authorization: `Bearer ${token.token}` } }
  //       );

  //       return {
  //         message: "Token updated",
  //         newToken: refresh.data
  //       };
  //     }

  //     return { message: "Token is still valid" };
  //   } catch (error) {
  //     console.error("Error refreshing token:", error);
  //     return { message: "Failed to refresh token", error: error.message };
  //   }
  // }


  // async getToken(loginDto: SignInDto) {
  //   try {
  //     const response = await axios.post("https://notify.eskiz.uz/api/auth/login", loginDto);
  //     const token = response.data.data.token;

  //     await this.prisma.token.create({ data: token });
  //     return response.data;
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }



}
