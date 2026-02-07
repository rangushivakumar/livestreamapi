import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Restaurant } from '../../entities/restaurant/restaurant.entity';
import { RestaurantStatus } from '../../entities/restaurant/enums/restaurant-status.enum';
import { UserRole } from '../../entities/user/enums/user.enum';

@Injectable()
export class RestaurantGuard implements CanActivate {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user as { sub: number; role: UserRole };

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    // SUPER_ADMIN can access admin routes without being tied to a restaurant
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: user.sub } },
      relations: ['owner'],
    });

    if (!restaurant) {
      throw new ForbiddenException('Restaurant not found for this user');
    }

    if (restaurant.status === RestaurantStatus.INACTIVE) {
      throw new ForbiddenException('Restaurant is inactive');
    }

    (request as any).restaurant_id = restaurant.id;
    (request as any).restaurant = restaurant;

    return true;
  }
}

