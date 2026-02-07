import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  BaseEntity,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Otp extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  otp: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'datetime', nullable: true })
  codeExpiry: Date;

  @Column({ type: 'datetime', nullable: true })
  nextOtp: Date;

  @CreateDateColumn()
  createdOn: Date;

  async setCodeExpiry(date: Date, minutes: number): Promise<void> {
    this.codeExpiry = new Date(date.getTime() + minutes * 60 * 1000);
  }

  async setNextOtp(date: Date, minutes: number): Promise<void> {
    this.nextOtp = new Date(date.getTime() + minutes * 60 * 1000);
  }
}
