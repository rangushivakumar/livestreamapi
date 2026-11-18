import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class StreamEventDto {
  @IsInt()
  @Min(1)
  streamId!: number;
}

export class ChatMessageDto extends StreamEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(Number(process.env.CHAT_MAX_MESSAGE_LENGTH) || 500)
  message!: string;
}
