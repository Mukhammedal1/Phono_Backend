import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('open-chat')
  async openChat(@Body() body: { clientId: number; productId: number }) {
    return this.chatService.openChat(body.clientId, body.productId);
  }

  @Get("user/:id")
  async getUserChats(@Param('id') id: number) {
    return this.chatService.getPhoneWithOwner(id);
  }

  // @Get("client/:id")
  // async getClientChats(@Param('id') id: number) {
  //   return this.chatService.getUserChats(id);
  // }
}
