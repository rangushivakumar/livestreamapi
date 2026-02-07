import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, OneToMany, JoinColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";
import { MenuItem } from "./items.entity";

// category.entity.ts
@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
 
  @Column()
  name: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.categories)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @Column()
  restaurantId: number;

  @OneToMany(() => MenuItem, (item) => item.category)
  items: MenuItem[];
}
