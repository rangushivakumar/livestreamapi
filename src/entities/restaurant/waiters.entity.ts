import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@Entity()
export class Waiter extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    mobile: string;

    @Column()
    name: string;

    @Column()
    upiId: string;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.waiters, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'restaurantId' })
    restaurant: Restaurant;

    @Column()
    restaurantId: number;

    @CreateDateColumn() 
    createdOn: Date;

    @UpdateDateColumn()
    updatedOn: Date;

    @DeleteDateColumn()
    deletedOn: Date;

    @Column({default: true})
    isActive: boolean;

    @Column({ nullable: true })
    tableNumber: number;
}