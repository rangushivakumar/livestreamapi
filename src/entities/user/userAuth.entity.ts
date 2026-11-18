import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AuthProvider } from "./enums/user.enum";
import { User } from "./user.entity";
import { Exclude } from "class-transformer";
import * as bcrypt from 'bcrypt';
import { Otp } from "../otp/otp.entity";

@Entity()
export class UserAuth extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'userId' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.userAuth, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ nullable: true })
  googleId!: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
  })
  provider!: AuthProvider;

  @Column({ name: 'provider_user_id', length: 255 })
  providerUserId!: string;

  @Column({ name: 'email', nullable: true, length: 255 })
  email!: string;

  @Column({ name: 'phone_number', nullable: true, length: 30 })
  phoneNumber!: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password!: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  salt!: string;

  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Otp, (otp) => otp.userAuth)
  otp!: Otp[];

  async createPassword(newPassword: string): Promise<boolean> {
    this.salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(newPassword, this.salt);
    return true;
  }

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}