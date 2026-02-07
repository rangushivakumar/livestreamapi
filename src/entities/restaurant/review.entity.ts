import { PrimaryGeneratedColumn, Entity, BaseEntity, Column, ManyToOne, JoinColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@Entity()
export class Review extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    review: string;

    @Column()
    rating: number;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.reviews)
    @JoinColumn({ name: 'restaurantId' })
    restaurant: Restaurant;

    @Column()
    restaurantId: number;
}