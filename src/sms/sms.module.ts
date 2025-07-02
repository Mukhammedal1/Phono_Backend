import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [SmsService],
  exports: [SmsService]
})
export class SmsModule {}
