import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user/user.entity';
import { UserRole, UserStatus } from '../entities/user/enums/user.enum';
import { LiveKitService } from '../livekit/livekit.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { Stream } from './entities/stream.entity';
import { StreamStatus } from './enums/stream-status.enum';

@Injectable()
export class StreamsService {
  constructor(
    @InjectRepository(Stream) private readonly streams: Repository<Stream>,
    private readonly liveKit: LiveKitService,
  ) {}

  async create(dto: CreateStreamDto, user: User) {
    this.requireActiveStreamer(user);
    const stream = this.streams.create({
      streamerId: user.id,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      roomName: `stream_${user.id}_${Date.now()}`,
      status: StreamStatus.CREATED,
    });
    return this.toResponse(await this.streams.save(stream));
  }

  async findLive() {
    const streams = await this.streams.find({
      where: { status: StreamStatus.LIVE },
      relations: { streamer: true },
      order: { startedAt: 'DESC' },
    });
    return streams.map((stream) => this.toResponse(stream, true));
  }

  async findOne(id: number) {
    return this.toResponse(await this.findById(id));
  }

  async start(id: number, user: User) {
    this.requireActiveStreamer(user);
    const stream = await this.findById(id);
    this.requireOwner(stream, user);
    this.requireStatus(stream, StreamStatus.CREATED);

    await this.liveKit.createRoom(stream.roomName);
    try {
      const token = await this.liveKit.createStreamerToken(
        stream.roomName,
        user.id,
      );
      stream.status = StreamStatus.LIVE;
      stream.startedAt = new Date();
      const saved = await this.streams.save(stream);
      return {
        stream: this.toResponse(saved),
        livekit: { serverUrl: this.liveKit.getServerUrl(), token },
      };
    } catch (error) {
      await this.liveKit.deleteRoom(stream.roomName).catch(() => undefined);
      throw error instanceof Error
        ? error
        : new InternalServerErrorException('Unable to start stream');
    }
  }

  async join(id: number, user: User) {
    const stream = await this.findById(id);
    this.requireStatus(stream, StreamStatus.LIVE);
    const token = await this.liveKit.createViewerToken(
      stream.roomName,
      user.id,
    );
    return {
      stream: this.toResponse(stream),
      livekit: { serverUrl: this.liveKit.getServerUrl(), token },
    };
  }

  async end(id: number, user: User) {
    this.requireActiveStreamer(user);
    const stream = await this.findById(id);
    this.requireOwner(stream, user);
    this.requireStatus(stream, StreamStatus.LIVE);
    stream.status = StreamStatus.ENDED;
    stream.endedAt = new Date();
    const saved = await this.streams.save(stream);
    await this.liveKit.deleteRoom(saved.roomName).catch(() => undefined);
    return this.toResponse(saved);
  }

  private async findById(id: number) {
    const stream = await this.streams.findOne({
      where: { id },
      relations: { streamer: true },
    });
    if (!stream) throw new NotFoundException('Stream not found');
    return stream;
  }

  private requireActiveStreamer(user: User) {
    if (user.role !== UserRole.STREAMER || user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        'Only active streamers may perform this action',
      );
    }
  }

  private requireOwner(stream: Stream, user: User) {
    if (stream.streamerId !== user.id)
      throw new ForbiddenException('You do not own this stream');
  }

  private requireStatus(stream: Stream, expected: StreamStatus) {
    if (stream.status !== expected)
      throw new BadRequestException(`Stream must be ${expected}`);
  }

  private toResponse(stream: Stream, includeStreamer = false) {
    const result: Record<string, unknown> = {
      id: stream.id,
      title: stream.title,
      description: stream.description,
      status: stream.status,
      thumbnailUrl: stream.thumbnailUrl,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
      createdAt: stream.createdAt,
      updatedAt: stream.updatedAt,
    };
    if (includeStreamer || stream.streamer) {
      result.streamer = stream.streamer && {
        id: stream.streamer.id,
        displayName: stream.streamer.displayName,
        avatarUrl: null,
      };
    }
    return result;
  }
}
