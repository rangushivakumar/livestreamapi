import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../entities/user/user.entity';
import { CreateStreamDto } from './dto/create-stream.dto';
import { StreamsService } from './streams.service';
import { ClassSerializerInterceptor } from '@nestjs/common';

@Controller('streams')
@UseInterceptors(ClassSerializerInterceptor)
export class StreamsController {
  constructor(private readonly streams: StreamsService) {}

  @Post('/create')
  @UseGuards(AuthGuard())
  create(@Body() dto: CreateStreamDto, @GetUser() user: User) {
    return this.streams.create(dto, user);
  }

  @Get('live')
  findLive() {
    return this.streams.findLive();
  }

  @Get(':streamId')
  findOne(@Param('streamId', ParseIntPipe) id: number) {
    return this.streams.findOne(id);
  }

  @Post(':streamId/start')
  @UseGuards(AuthGuard())
  start(@Param('streamId', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.streams.start(id, user);
  }

  @Post(':streamId/join')
  @UseGuards(AuthGuard())
  join(@Param('streamId', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.streams.join(id, user);
  }

  @Post(':streamId/end')
  @UseGuards(AuthGuard())
  end(@Param('streamId', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.streams.end(id, user);
  }
}
