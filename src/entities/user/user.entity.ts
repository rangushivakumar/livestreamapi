import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { UserRole, UserStatus } from './enums/user.enum';
import { UserAuth } from './userAuth.entity';
import { UserSession } from './userSession.entity';
import { Stream } from '../../streams/entities/stream.entity';
import { StreamMessage } from '../../realtime/entities/stream-message.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'public_id', unique: true, length: 32 })
  publicId!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ name: 'display_name', length: 100 })
  displayName!: string;

  @OneToMany(() => UserAuth, (userAuth) => userAuth.user)
  userAuth!: UserAuth[];

  @OneToMany(() => UserSession, (userSession) => userSession.user)
  userSession!: UserSession[];

  @OneToMany(() => Stream, (stream) => stream.streamer)
  streams!: Stream[];

  @OneToMany(() => StreamMessage, (message) => message.user)
  streamMessages!: StreamMessage[];
}
