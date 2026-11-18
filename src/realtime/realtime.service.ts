import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user/user.entity';
import { Stream } from '../streams/entities/stream.entity';
import { StreamStatus } from '../streams/enums/stream-status.enum';
import { ChatMessageDto } from './dto/stream-event.dto';
import { StreamMessage } from './entities/stream-message.entity';

@Injectable()
export class RealtimeService {
  private readonly sentAt = new Map<string, number[]>();
  private readonly rateWindowMs = Number(process.env.CHAT_RATE_WINDOW_MS) || 10_000;
  private readonly maxMessagesPerWindow =
    Number(process.env.CHAT_RATE_LIMIT) || 5;
  private readonly maxMessageLength =
    Number(process.env.CHAT_MAX_MESSAGE_LENGTH) || 500;

  constructor(
    @InjectRepository(Stream) private readonly streams: Repository<Stream>,
    @InjectRepository(StreamMessage)
    private readonly messages: Repository<StreamMessage>,
  ) {}

  async requireLiveStream(streamId: number): Promise<Stream> {
    this.validateStreamId(streamId);
    const stream = await this.streams.findOne({ where: { id: streamId } });
    if (!stream) throw new NotFoundException('Stream not found');
    if (stream.status !== StreamStatus.LIVE) {
      throw new BadRequestException('Stream must be LIVE');
    }
    return stream;
  }

  validateStreamId(streamId: number) {
    if (!Number.isInteger(streamId) || streamId < 1) {
      throw new BadRequestException('streamId must be a positive integer');
    }
  }

  async saveMessage(dto: ChatMessageDto, user: User) {
    await this.requireLiveStream(dto.streamId);
    const message = dto.message.trim();
    if (!message) throw new BadRequestException('message must not be empty');
    if (message.length > this.maxMessageLength) {
      throw new BadRequestException(
        `message must be ${this.maxMessageLength} characters or fewer`,
      );
    }
    this.checkRateLimit(user.id, dto.streamId);
    const saved = await this.messages.save(
      this.messages.create({ streamId: dto.streamId, userId: user.id, message }),
    );
    return {
      id: saved.id,
      streamId: saved.streamId,
      message: saved.message,
      createdAt: saved.createdAt,
      user: { id: user.id, displayName: user.displayName, avatarUrl: null },
    };
  }

  async recentMessages(streamId: number, limit = 50) {
    this.validateStreamId(streamId);
    const stream = await this.streams.findOne({ where: { id: streamId } });
    if (!stream) throw new NotFoundException('Stream not found');
    const rows = await this.messages.find({
      where: { streamId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 100),
    });
    return rows.map((row) => ({
      id: row.id,
      streamId: row.streamId,
      message: row.message,
      createdAt: row.createdAt,
      user: {
        id: row.user.id,
        displayName: row.user.displayName,
        avatarUrl: null,
      },
    }));
  }

  private checkRateLimit(userId: number, streamId: number) {
    const now = Date.now();
    const key = `${userId}:${streamId}`;
    const recent = (this.sentAt.get(key) || []).filter(
      (timestamp) => now - timestamp < this.rateWindowMs,
    );
    if (recent.length >= this.maxMessagesPerWindow) {
      this.sentAt.set(key, recent);
      throw new HttpException(
        'Chat rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    recent.push(now);
    this.sentAt.set(key, recent);
  }
}
