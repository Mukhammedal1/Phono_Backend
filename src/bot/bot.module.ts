import { forwardRef, Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { PhoneModule } from '../phone/phone.module';

@Module({
  imports: [forwardRef(() => PhoneModule)],
  providers: [BotService, BotUpdate],
  exports: [BotService],
})
export class BotModule {}
