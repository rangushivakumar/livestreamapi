import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveKitModule } from '../livekit/livekit.module';
import { Stream } from './entities/stream.entity';
import { StreamsController } from './streams.controller';
import { StreamsService } from './streams.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([Stream]), LiveKitModule,PassportModule.register({ defaultStrategy: 'jwt' }),],
  controllers: [StreamsController],
  providers: [StreamsService],
})
export class StreamsModule {}
