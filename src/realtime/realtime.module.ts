import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../entities/user/user.entity';
import { Stream } from '../streams/entities/stream.entity';
import { StreamMessage } from './entities/stream-message.entity';
import { MessagesController } from './messages.controller';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User, Stream, StreamMessage]),
  ],
  controllers: [MessagesController],
  providers: [RealtimeGateway, RealtimeService],
})
export class RealtimeModule {}
