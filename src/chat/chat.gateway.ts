// Update this DTO to match your models
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private onlineUsers = new Map<number, string>();
  private userChats = new Map<number, number[]>();

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessagesService,
  ) { }

  async handleConnection(client: Socket) {
    const userId = parseInt(client.handshake.query.userId as string);
    if (userId && !isNaN(userId)) {
      this.onlineUsers.set(userId, client.id);
      client.broadcast.emit('userOnline', { userId });
      console.log(`User ${userId} connected with socket ID ${client.id}`);

      // Auto-join user to all their chat rooms
      try {
        // Fetch user's chats - modify this to match your service method
        const userChats = await this.chatService.findUserChats(userId);
        if (userChats && userChats.length > 0) {
          // Store the user's chats for later use
          this.userChats.set(userId, userChats.map(chat => chat.id));

          // Join each chat room
          for (const chat of userChats) {
            client.join(`chat-${chat.id}`);
            console.log(`Auto-joined user ${userId} to chat-${chat.id}`);

            // Get unread count for this chat
            const count = await this.messageService.getUnreadCount(chat.id, userId);
            client.emit(`unreadCount:${chat.id}`, { count });
          }
        }
      } catch (error) {
        console.error(`Error auto-joining chats for user ${userId}:`, error);
      }
    } else {
      console.log(`Client connected without valid userId: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    let disconnectedUserId: number | null = null;

    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        disconnectedUserId = userId;
        this.onlineUsers.delete(userId);
        client.broadcast.emit('userOffline', { userId });

        // Remove user from chats tracking
        this.userChats.delete(userId);
        break;
      }
    }

    console.log(`Client disconnected: ${client.id}${disconnectedUserId ? ` (User ${disconnectedUserId})` : ''}`);
  }

  @SubscribeMessage('createChat')
  async handleCreateChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const chat = await this.chatService.openChat(data.senderId, data.productId);

    // Emit to sender and also everyone else who might be interested
    client.emit('chatCreated', chat);

    // Also broadcast to seller based on product-seller relationship
    // This assumes your chat service can provide the seller ID
    const sellerId = chat.senderId; // Adjust this based on your data structure
    if (sellerId) {
      const sellerSocketId = this.onlineUsers.get(sellerId);
      if (sellerSocketId) {
        this.server.to(sellerSocketId).emit('chatCreated', chat);
      }
    }

    return chat;
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat-${chatId}`);
    console.log(`Client ${client.id} joined room chat-${chatId}`);
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`chat-${chatId}`);
    console.log(`Client ${client.id} left room chat-${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.messageService.createMessage(createMessageDto);

      // Emit to the room - including the sender
      this.server.to(`chat-${createMessageDto.chatId}`).emit(
        `newMessage:${createMessageDto.chatId}`,
        message,
      );

      // If the other user is not in the chat room, we still need to notify them
      const chat = await this.chatService.findOne(createMessageDto.chatId);

      // Since our Chat model doesn't have a direct receiverId, we need to 
      // find the other user involved in this chat.
      // For Phone ownership, we need to query to find who owns that phone
      let otherUserId: number;

      // If message sender is the chat initiator, the receiver is the phone owner
      if (createMessageDto.senderId === chat?.senderId) {
        // Need to fetch the Phone owner - this is a placeholder
        // Replace with your actual logic to get the phone owner ID
        const phone = await this.chatService.getPhoneWithOwner(chat!.phoneId);
        otherUserId = phone?.userId!; // Use your actual property name
      } else {
        // If message sender is NOT the chat initiator, the receiver is the chat initiator
        otherUserId = chat?.senderId!;
      }

      if (otherUserId) {
        const otherUserSocketId = this.onlineUsers.get(otherUserId);
        if (otherUserSocketId) {
          // Update their unread count
          const count = await this.messageService.getUnreadCount(
            createMessageDto.chatId,
            otherUserId,
          );
          this.server.to(otherUserSocketId).emit(`unreadCount:${createMessageDto.chatId}`, { count });
        }
      }

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('errorEvent', {
        message: 'Failed to send message',
        details: error.message
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { chatId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`chat-${data.chatId}`).emit(`typing:${data.chatId}`, {
      userId: data.userId,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: { chatId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`chat-${data.chatId}`).emit(`stopTyping:${data.chatId}`, {
      userId: data.userId,
    });
  }

  // Add handler for both event names for backward compatibility
  @SubscribeMessage('readMessages')
  async handleReadMessages(
    @MessageBody() data: { chatId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    return this.handleMarkAsRead(data, client);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { chatId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.messageService.markMessagesAsRead(data.chatId, data.userId);

      // Broadcast to the entire room that messages were read
      this.server.to(`chat-${data.chatId}`).emit(`messagesRead:${data.chatId}`, {
        userId: data.userId,
      });

      // Update unread count for this user
      const count = await this.messageService.getUnreadCount(
        data.chatId,
        data.userId,
      );
      client.emit(`unreadCount:${data.chatId}`, { count });

      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      client.emit('errorEvent', {
        message: 'Failed to mark messages as read',
        details: error.message
      });
    }
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(
    @MessageBody() data: { chatId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const count = await this.messageService.getUnreadCount(
        data.chatId,
        data.userId,
      );
      client.emit(`unreadCount:${data.chatId}`, { count });
      return { count };
    } catch (error) {
      console.error('Error getting unread count:', error);
      client.emit('errorEvent', {
        message: 'Failed to get unread count',
        details: error.message
      });
    }
  }
}