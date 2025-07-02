import { Module } from '@nestjs/common';
import { PhonoNumberService } from './phono-number.service';
import { PhonoNumberController } from './phono-number.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PhonoNumberController],
  providers: [PhonoNumberService],
})
export class PhonoNumberModule {}
