import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../entities/user/user.entity';
import { Stream } from '../../streams/entities/stream.entity';

@Entity('stream_messages')
@Index(['streamId', 'createdAt'])
export class StreamMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'stream_id' })
  streamId!: number;

  @ManyToOne(() => Stream, (stream) => stream.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stream_id' })
  stream!: Stream;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.streamMessages, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 500 })
  message!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
