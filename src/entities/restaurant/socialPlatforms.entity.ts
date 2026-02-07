import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@Entity()
export class SocialPlatforms extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    instagram: string;

    @Column({ nullable: true })
    facebook: string;

    @Column({ nullable: true })
    twitter: string;

    @Column({ nullable: true })
    linkedin: string;

    @Column({ nullable: true })
    youtube: string;

    @OneToOne(() => Restaurant, (restaurant) => restaurant.socialPlatforms, {
        onDelete: "CASCADE",
    })
    @JoinColumn({name: "restaurantId"}) // FK live here
    restaurant: Restaurant;

    @Column()
    restaurantId: number;
}