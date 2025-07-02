import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PhoneService } from '../phone/phone.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly phoneService: PhoneService
  ) { }

  // Get one chat with messages and phone
  async findOne(chatId: number) {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' }
        },
        Phone: true
      }
    });
  }

  // Get all chats where user is involved (as sender or phone owner)
  async findUserChats(userId: number) {
    // Chats where user is the sender
    const senderChats = await this.prisma.chat.findMany({
      where: { senderId: userId },
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1
        },
        Phone: true
      }
    });

    // Phones owned by the user
    const userPhones = await this.prisma.phone.findMany({
      where: { userId }
    });

    const phoneIds = userPhones.map(phone => phone.id);

    // Chats where user owns the phone but is not the sender
    const receiverChats = await this.prisma.chat.findMany({
      where: {
        phoneId: { in: phoneIds },
        senderId: { not: userId }
      },
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1
        },
        Phone: true
      }
    });

    return [...senderChats, ...receiverChats];
  }

  async getPhoneWithOwner(phoneId: number) {
    return this.prisma.phone.findUnique({
      where: { id: phoneId },
      include: {
        User: true
      }
    });
  }

  async openChat(senderId: number, phoneId: number) {
    let chat = await this.prisma.chat.findFirst({
      where: {
        senderId: senderId,
        phoneId: phoneId
      },
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1
        },
        Phone: true
      }
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          senderId: senderId,
          phoneId: phoneId
        },
        include: {
          messages: true,
          Phone: true
        }
      });
    }

    return chat;
  }
}
