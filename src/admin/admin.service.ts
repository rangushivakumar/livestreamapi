import { BadRequestException, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant/restaurant.entity';
import { User } from '../entities/user/user.entity';
import { CreateCategoryDto, CreateCategoryItemsDto, CreateRestaurantDto, CreateWaiterDto, GetCategoriesDto, GetMenuItemsDto, UpdateCategoryDto, UpdateRestaurantDto, UpdateReviewDto, UpdateReviewLinkDto } from './dto/create-restaurant.dto';
import { UserRole } from '../entities/user/enums/user.enum';
import { RestaurantStatus } from 'src/entities/restaurant/enums/restaurant-status.enum';
import { Review } from 'src/entities/restaurant/review.entity';
import { Category } from 'src/entities/restaurant/category.entity';
import { MenuItem } from 'src/entities/restaurant/items.entity';
import { count } from 'console';
import { Waiter } from 'src/entities/restaurant/waiters.entity';
import { SocialPlatforms } from 'src/entities/restaurant/socialPlatforms.entity';

@Injectable()
export class AdminService {
  constructor(
  ) {}

  async createRestaurantForAdmin(
    user,
    dto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    try {
      const { name, address, email, city, phone, description, reviewUrl } = dto;

    const existing = await Restaurant.findOne({
      where : { ownerId: user.id }
    })

    if (existing) {
      throw new BadRequestException('Admin already has a restaurant');
    }

    const owner = await User.findOne({
      where: { id: user.id },
    });

    if (!owner) {
      throw new BadRequestException('Owner not found');
    }

    const restaurant = new Restaurant();
    restaurant.address = address;
    restaurant.email = email;
    restaurant.phone = phone;
    restaurant.city = city;
    restaurant.description = description || '';
    restaurant.owner = user;
    restaurant.name = name;
    restaurant.googleReviewLink = reviewUrl;
    restaurant.status = RestaurantStatus.ACTIVE;
    await restaurant.save()
    return restaurant;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getRestaurantForAdmin(user: User): Promise<Restaurant> {
    const restaurant = await Restaurant.findOne({
      where: { owner: { id: user.id } },
    });
  
    if (!restaurant) {
      throw new BadRequestException('Restaurant not found');
    }
  
    return restaurant;
  }

  async updateRestaurantForAdmin(
    restaurantId: number,
    user: User,
    dto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurant = await Restaurant.createQueryBuilder('restaurant')
      .where('restaurant.id = :id', { id: restaurantId })
      .andWhere('restaurant.ownerId = :ownerId', { ownerId: user.id })
      .getOne();
  
    if (!restaurant) {
      throw new BadRequestException('Restaurant not found or access denied');
    }
  
    if (dto.name !== undefined) {
      restaurant.name = dto.name;
    }
  
    if (dto.address !== undefined) {
      restaurant.address = dto.address;
    }
  
    if (dto.city !== undefined) {
      restaurant.city = dto.city;
    }
  
    if (dto.email !== undefined) {
      restaurant.email = dto.email;
    }
  
    if (dto.phone !== undefined) {
      restaurant.phone = dto.phone;
    }
  
    if (dto.reviewUrl !== undefined) {
      restaurant.googleReviewLink = dto.reviewUrl;
    }
  
    if (dto.description !== undefined) {
      restaurant.description = dto.description;
    }
  
    return restaurant.save();
  }

  async updateReviewForAdmin(
    restaurantId: number,
    user: User,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const restaurant = await Restaurant.createQueryBuilder('restaurant')
      .where('restaurant.id = :id', { id: restaurantId })
      .andWhere('restaurant.ownerId = :ownerId', { ownerId: user.id })
      .getOne();

    if (!restaurant) {
      throw new BadRequestException('Restaurant not found or access denied');
    }

    const review = new Review();
    review.review = dto.review;
    review.rating = dto.rating;
    review.restaurant = restaurant;
    review.restaurantId = restaurant.id;
    await review.save();
    return review;
  }

  async updateReviewLinkForAdmin(
    restaurantId: number,
    user: User,
    dto: UpdateReviewLinkDto,
  ): Promise<Restaurant> {
    const restaurant = await Restaurant.createQueryBuilder('restaurant')
      .where('restaurant.id = :id', { id: restaurantId })
      .andWhere('restaurant.ownerId = :ownerId', { ownerId: user.id })
      .getOne();
  
    if (!restaurant) {
      throw new BadRequestException('Restaurant not found or access denied');
    }

    restaurant.googleReviewLink = dto.reviewUrl;
    return restaurant.save();
  }


  async getReviewsForAdmin(
    restaurantId: number,
    user: User,
  ): Promise<Review[]> {
    const restaurant = await Restaurant.createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.reviews', 'reviews')
      .where('restaurant.id = :id', { id: restaurantId })
      .andWhere('restaurant.ownerId = :ownerId', { ownerId: user.id })
      .getOne();

    if (!restaurant) {
      throw new BadRequestException('Restaurant not found or access denied');
    }

    return restaurant.reviews;
  }

  async createCategoryForAdmin(
    user: User,
    dto: CreateCategoryDto,
  ): Promise<Category> {
    console.log('Creating category with DTO:', dto);
    try {
      const restaurant = await Restaurant.findOne({
      where: { ownerId: user.id },
    });
    if (!restaurant) {
      throw new Error('Restaurant not found for admin');
    }
    const category = new Category();
    category.name = dto.name;
    category.restaurant = restaurant;
    return category.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateCategoryForAdmin(
    categoryId: number,
    user: User,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await Category.createQueryBuilder('category')
      .where('category.id = :id', { id: categoryId })
      .andWhere('category.restaurantId = :restaurantId', { restaurantId: user.restaurants[0].id })
      .getOne();

    if (!category) {
      throw new BadRequestException('Category not found or access denied');
    }

    category.name = dto.name || '';
    return category.save();
  }

  async deleteCategoryForAdmin(
    categoryId: number,
    user: User,
  ): Promise<void> {
    const category = await Category.createQueryBuilder('category')
      .where('category.id = :id', { id: categoryId })
      .andWhere('category.restaurantId = :restaurantId', { restaurantId: user.restaurants[0].id })
      .getOne();

    if (!category) {
      throw new BadRequestException('Category not found or access denied');
    }

    await category.remove();
  }


  async getCategoriesForAdmin(
    user: User,
    dto: GetCategoriesDto
  ): Promise<{ categories: Category[], total: number }> {
    const { name, skip, limit } = dto;
    const restaurant = await Restaurant.findOne({
      where: { ownerId: user.id },
    });
    if (!restaurant) {
      throw new BadRequestException('Restaurant not found for admin');
    }
    const categories = await Category.createQueryBuilder('category')
      .where('category.restaurantId = :restaurantId', { restaurantId: restaurant.id })
  

      if(name !== undefined) {
        categories.andWhere('category.name LIKE :name', { name: `%${name}%` });
      }
      const total = await categories.getCount();
      if(skip !== undefined && limit !== undefined) {
        categories.skip(skip).take(limit);
      }
    const categoriesResult = await categories.getMany();

    return {
      categories: categoriesResult,
      total: total,
    };
  }

  async createCategoryItemsForAdmin(user: User, dto: CreateCategoryItemsDto) {
    try {
      const check = await Restaurant.findOne({
        where: { ownerId: user.id },
      });
      if (!check) {
        throw new BadRequestException('Restaurant not found for admin');
      }
      const arrayItems: MenuItem[] = [];
      for (const itemDto of dto.items) {
        const { name, description, price, imageUrl, isAvailable } = itemDto;
        const category = await Category.findOne({
          where: { id: itemDto.categoryId, restaurantId: check.id },
        });
        if (!category) {
          throw new Error(`Category with ID ${itemDto.categoryId} not found for this restaurant`);
        }
        const menuItem = new MenuItem();
        menuItem.name = name;
        menuItem.description = description || '';
        menuItem.price = price;
        menuItem.imageUrl = imageUrl || '';
        menuItem.isAvailable = isAvailable !== undefined ? isAvailable : true;
        menuItem.category = category;
        menuItem.categoryId = category.id;
        await MenuItem.save(menuItem);
        arrayItems.push(menuItem);
      } 
      return {
        res : {
          items: arrayItems,
          count: arrayItems.length,
        }
      }
    } catch (error) {
      throw new BadRequestException(error.message); 
      }
    }

    async updateCategoryItemForAdmin(
      itemId: number,
      user: User,
      dto: CreateCategoryItemsDto,
    ): Promise<MenuItem> {
      try {
        const check = await Restaurant.findOne({
          where: { ownerId: user.id },
        });
        if (!check) {
          throw new BadRequestException('Restaurant not found for admin');
        }
        const menuItem = await MenuItem.createQueryBuilder('menuItem')
          .leftJoinAndSelect('menuItem.category', 'category')
          .where('menuItem.id = :itemId', { itemId })
          .andWhere('category.restaurantId = :restaurantId', { restaurantId: check.id })
          .getOne();
        if (!menuItem) {
          throw new BadRequestException('Menu item not found or access denied');
        }
        const { name, description, price, imageUrl, isAvailable } = dto.items[0];
        menuItem.name = name;
        menuItem.description = description || '';
        menuItem.price = price;
        menuItem.imageUrl = imageUrl || '';
        menuItem.isAvailable = isAvailable !== undefined ? isAvailable : true;
        return await MenuItem.save(menuItem);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    async createWaitersForRestaurant(user: User, dto: CreateWaiterDto) {
      try {
        const restaurant = await Restaurant.findOne({
          where: { ownerId: user.id },
        });
        if (!restaurant) {
          throw new BadRequestException('Restaurant not found for admin');
        }
        const arrayWaiters: Waiter[] = [];
        for (const waiterDto of dto.waiters) {
          const { name, mobile, upiId } = waiterDto;
          const waiter = new Waiter();
          waiter.name = name;
          waiter.mobile = mobile || '';
          waiter.upiId = upiId;
          waiter.restaurant = restaurant;
          waiter.restaurantId = restaurant.id;
          await Waiter.save(waiter);
          arrayWaiters.push(waiter);
        }
        return {
          res : {
            waiters: arrayWaiters,
            count: arrayWaiters.length,
          }
        }
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    async createSocialPlatformsForAdmin(user: User, dto: any) {
      const check = await Restaurant.findOne({
        where: { ownerId: user.id },
      });
      if (!check) {
        throw new BadRequestException('Restaurant not found for admin');
      }
      const socialPlatforms = new SocialPlatforms();
      socialPlatforms.instagram = dto.instagram || '';
      socialPlatforms.facebook = dto.facebook || '';
      socialPlatforms.twitter = dto.twitter || '';
      socialPlatforms.linkedin = dto.linkedin || '';
      socialPlatforms.youtube = dto.youtube || '';
      socialPlatforms.restaurant = check;
      socialPlatforms.restaurantId = check.id;
      await SocialPlatforms.save(socialPlatforms);
      return { message: 'Social platforms created successfully' };
    }

    async getMenuItems(query: GetMenuItemsDto, user: User) {
    const { skip, limit, categoryId } = query;

    const qb = await MenuItem
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('category.restaurant', 'restaurant')
      .where('restaurant.ownerId = :ownerId', { ownerId: user.id })
      .andWhere('item.isAvailable = :isAvailable', { isAvailable: true });
    
    const count = await qb.getCount();

    if (skip !== undefined) {
      qb.skip(skip);
    }
    if (limit !== undefined) {
      qb.take(limit);
    }


    if (categoryId) {
      qb.andWhere('item.categoryId = :categoryId', { categoryId });
    }

    const items = await qb.getMany();

    return {
      result: {
        list: items,
        count: count,
      }
    }
  }

  async getWaitersForRestaurant(user: User) {
    const restaurant = await Restaurant.findOne({
      where: { ownerId: user.id },
    });
    if (!restaurant) {
      throw new BadRequestException('Restaurant not found for admin');
    }
    const waiters = await Waiter.find({
      where: { restaurantId: restaurant.id },
    });
    return {
      waiters: waiters,
      count: waiters.length,
    };
  }

  async getSocialPlatformsForAdmin(user: User) {
    const restaurant = await Restaurant.findOne({
      where: { ownerId: user.id },
    });
    if (!restaurant) {
      throw new BadRequestException('Restaurant not found for admin');
    }
    const socialPlatforms = await SocialPlatforms.findOne({
      where: { id: restaurant.id },
    });
    return socialPlatforms;
  }

}