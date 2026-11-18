import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../entities/user/user.entity';
import { StreamStatus } from '../enums/stream-status.enum';
import { StreamMessage } from '../../realtime/entities/stream-message.entity';

@Entity('streams')
@Index(['status', 'startedAt'])
@Index(['streamerId'])
export class Stream {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'streamer_id' })
  streamerId!: number;

  @ManyToOne(() => User, (user) => user.streams, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'streamer_id' })
  streamer!: User;

  @Column({ length: 150 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'room_name', unique: true, length: 80 })
  roomName!: string;

  @Index()
  @Column({ type: 'enum', enum: StreamStatus, default: StreamStatus.CREATED })
  status!: StreamStatus;

  @Column({ nullable: true })
  thumbnailUrl!: string;

  @Index()
  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt!: Date | null;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => StreamMessage, (message) => message.stream)
  messages!: StreamMessage[];
}
