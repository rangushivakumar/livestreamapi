import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionOrderStatus } from './enums/user.enum';

@Entity()
export class UserSubscriptionOrder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // Razorpay order ID
  @Column({ unique: true })
  razorpayOrderId!: string;

  // Razorpay payment ID after successful payment
  @Column({ nullable: true })
  razorpayPaymentId!: string;

  // Razorpay signature after successful payment
  @Column({ nullable: true })
  razorpaySignature!: string;

  @Column({ type: 'float' })
  price!: number;

  @Column({
    type: 'enum',
    enum: SubscriptionOrderStatus,
    default: SubscriptionOrderStatus.CREATED,
  })
  status!: SubscriptionOrderStatus;

  @Column({ nullable: true })
  paidAt!: Date;

  @CreateDateColumn()
  createdOn!: Date;

  @UpdateDateColumn()
  updatedOn!: Date;
}
