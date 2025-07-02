import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import {
  AccessTokenStrategy,
  RefreshTokenCookieStrategy,
} from '../common/strategies';
import { SmsModule } from '../sms/sms.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    JwtModule.register({ global: true }),
    PrismaModule,
    UserModule,
    SmsModule,
    JwtModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    AccessTokenStrategy,
    RefreshTokenCookieStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
