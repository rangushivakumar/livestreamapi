import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Param,
} from '@nestjs/common';
import { RealtimeService } from './realtime.service';

@Controller('streams')
export class MessagesController {
  constructor(private readonly realtime: RealtimeService) {}

  @Get(':streamId/messages')
  recent(
    @Param('streamId', ParseIntPipe) streamId: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    if (limit < 1) {
      throw new BadRequestException('limit must be at least 1');
    }
    return this.realtime.recentMessages(streamId, Math.min(limit, 100));
  }
}
