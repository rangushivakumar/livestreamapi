import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.userSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ name: 'userId' })
  userId!: number;

  @Column({ name: 'refresh_token_hash', length: 255 })
  refreshTokenHash!: string;

  @Column({ nullable: true, length: 255 })
  deviceId!: string;

  @Column({ name: 'platform', nullable: true, length: 50 })
  platform!: string;

  @Column({ nullable: true })
  lastUsedAt!: Date;

  @Column()
  expiresAt!: Date;

  @Column({ nullable: true })
  revokedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
