import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { UserRole } from './enums/user.enum';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Restaurant } from '../restaurant/restaurant.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  mobile: string | null;

  @Column()
  name: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  salt: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ type: 'bool', default: false })
  is_verified: boolean;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  mobileVerified: boolean;

  @Column({ default: true })
  sendVerification: boolean;

  async createPassword(newPassword: string): Promise<boolean> {
    this.salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(newPassword, this.salt);
    return true;
  }

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];
}

