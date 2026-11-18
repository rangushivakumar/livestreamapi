import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user/user.entity';
import { UserStatus } from '../entities/user/enums/user.enum';
import { ChatMessageDto, StreamEventDto } from './dto/stream-event.dto';
import type { AuthenticatedSocket } from './interfaces/authenticated-socket.interface';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly realtime: RealtimeService,
  ) {}

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      const supplied = socket.handshake.auth?.token ||
        socket.handshake.headers.authorization;
      const token = typeof supplied === 'string'
        ? supplied.replace(/^Bearer\s+/i, '').trim()
        : '';
      if (!token) throw new Error('Authentication token is required');
      const payload = this.jwt.verify<{ id?: number }>(token, {
        secret: process.env.JWT_SECRET || 'changeme',
      });
      if (!payload.id) throw new Error('Invalid authentication token');
      const user = await this.users.findOne({
        where: { id: payload.id, status: UserStatus.ACTIVE },
      });
      if (!user) throw new Error('Active user not found');
      socket.user = user;
    } catch (error) {
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Unauthorized',
      });
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    for (const room of socket.rooms) {
      if (room.startsWith('stream:')) socket.leave(room);
    }
  }

  @SubscribeMessage('stream:join')
  async join(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() dto: StreamEventDto,
  ) {
    try {
      this.requireAuthenticated(socket);
      await this.realtime.requireLiveStream(dto.streamId);
      const room = `stream:${dto.streamId}`;
      await socket.join(room);
      return { ok: true, streamId: dto.streamId };
    } catch (error) {
      throw new WsException(this.messageFor(error));
    }
  }

  @SubscribeMessage('stream:leave')
  async leave(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() dto: StreamEventDto,
  ) {
    this.requireAuthenticated(socket);
    this.realtime.validateStreamId(dto.streamId);
    await socket.leave(`stream:${dto.streamId}`);
    return { ok: true, streamId: dto.streamId };
  }

  @SubscribeMessage('chat:send')
  async send(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() dto: ChatMessageDto,
  ) {
    try {
      this.requireAuthenticated(socket);
      const message = await this.realtime.saveMessage(dto, socket.user);
      this.server.to(`stream:${dto.streamId}`).emit('chat:message', message);
      return { ok: true, message };
    } catch (error) {
      throw new WsException(this.messageFor(error));
    }
  }

  private messageFor(error: unknown) {
    return error instanceof Error ? error.message : 'Request failed';
  }

  private requireAuthenticated(socket: AuthenticatedSocket) {
    if (!socket.user) {
      throw new WsException('Unauthorized');
    }
  }
  
}
