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
import { UserAuth } from '../user/userAuth.entity';

@Entity()
export class Otp extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  otp!: string;

  @ManyToOne(() => UserAuth,(userAuth) => userAuth.otp, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userAuthId' })
  userAuth!: UserAuth;

  @Column({ name: 'userAuthId'})
  userAuthId!: number;

  @Column({ type: 'datetime', nullable: true })
  codeExpiry!: Date;

  @Column({ type: 'datetime', nullable: true })
  nextOtp!: Date;

  @CreateDateColumn()
  createdOn!: Date;

  async setCodeExpiry(date: Date, minutes: number): Promise<void> {
    this.codeExpiry = new Date(date.getTime() + minutes * 60 * 1000);
  }

  async setNextOtp(date: Date, minutes: number): Promise<void> {
    this.nextOtp = new Date(date.getTime() + minutes * 60 * 1000);
  }
}
