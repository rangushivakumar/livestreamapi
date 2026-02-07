import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { RestaurantStatus } from './enums/restaurant-status.enum';
import { Category } from './category.entity';
import { Review } from './review.entity';
import { Waiter } from './waiters.entity';
import { SocialPlatforms } from './socialPlatforms.entity';

@Entity('restaurants')
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ type: 'varchar', unique: true })
  // slug: string;

  @Column()
  name: string

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: number;

  @Column({
    type: 'enum',
    enum: RestaurantStatus,
    default: RestaurantStatus.ACTIVE,
  })
  status: RestaurantStatus;

  @Column({ nullable: true })
  description: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  updatedOn: Date;

  @DeleteDateColumn()
  deletedOn: Date;

  @OneToMany(() => Category, (category) => category.restaurant)
  categories: Category

  @Column({ nullable: true })
  googleReviewLink: string

  @OneToMany(() => Review, (review) => review.restaurant)
  reviews: Review[];

  @OneToMany(() => Waiter, (waiter) => waiter.restaurant)
  waiters: Waiter[];

    @OneToOne(() => SocialPlatforms, (social) => social.restaurant)
  socialPlatforms: SocialPlatforms;
}

