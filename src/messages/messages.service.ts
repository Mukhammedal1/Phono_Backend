import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        message: createMessageDto.content || createMessageDto.content, // Support both field names
        chatId: createMessageDto.chatId,
        senderId: createMessageDto.senderId,
        isRead: false
      }
    });
  }

  // Mark messages as read for a specific user in a chat
  async markMessagesAsRead(chatId: number, userId: number) {
    return this.prisma.message.updateMany({
      where: {
        chatId: chatId,
        senderId: { not: userId }, // Only mark messages from other users as read
        isRead: false
      },
      data: {
        isRead: true
      }
    });
  }

  // Get unread message count for a user in a chat
  async getUnreadCount(chatId: number, userId: number) {
    const count = await this.prisma.message.count({
      where: {
        chatId: chatId,
        senderId: { not: userId }, // Only count messages from other users
        isRead: false
      }
    });
    return count;
  }
  
}
