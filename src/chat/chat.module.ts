import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { PhoneService } from '../phone/phone.service';
import { BotService } from '../bot/bot.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, PrismaService, MessagesService, PhoneService, BotService],
  exports: [ChatService, MessagesService]
})
export class ChatModule {}
