import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logging/winston.logger';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './logging/error.handling';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { RegionModule } from './region/region.module';
import { DistrictModule } from './district/district.module';
import { LanguageModule } from './language/language.module';
import { CurrencyModule } from './currency/currency.module';
import { BrandModule } from './brand/brand.module';
import { ModelModule } from './model/model.module';
import { ArchivesModule } from './archives/archives.module';
import { PhoneModule } from './phone/phone.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { PhonoNumberModule } from './phone-number/phono-number.module';
import { AuthModule } from './auth/auth.module';
import { SmsModule } from './sms/sms.module';
import { ColorModule } from './color/color.module';
import { AddressModule } from './address/address.module';
import { ChatModule } from './chat/chat.module';
import { PaymentModule } from './payment/payment.module';
import { MessagesModule } from './messages/messages.module';
import { AdminModule } from './admin/admin.module';
import { FileModule } from './file/file.module';
import { AdminAuthModule } from './admin_auth/admin_auth.module';
import { BotModule } from './bot/bot.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { MailModule } from './mail/mail.module';
import { ImageModule } from './image/image.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      // botName: process.env.BOT_NAME,
      useFactory: () => ({
        token: process.env.BOT_TOKEN || '12345',
        middlewares: [],
        include: [BotModule],
      }),
    }),
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    WinstonModule.forRoot(winstonConfig),
    PrismaModule,
    RegionModule,
    DistrictModule,
    LanguageModule,
    AddressModule,
    ChatModule,
    PaymentModule,
    MessagesModule,
    AdminModule,
    FileModule,
    CurrencyModule,
    BrandModule,
    ModelModule,
    ArchivesModule,
    PhoneModule,
    UserModule,
    EmailModule,
    PhonoNumberModule,
    AuthModule,
    SmsModule,
    ColorModule,
    AdminAuthModule,
    BotModule,
    MailModule,
    ImageModule,
    ReviewModule
  
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    PrismaService,
  ],
})
export class AppModule {}
