import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Restaurant } from '../entities/restaurant/restaurant.entity';
import { User } from '../entities/user/user.entity';
import { RestaurantGuard } from './guards/restaurant.guard';
import { AdminRepository } from './admin.repository';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, User]),
    forwardRef(() => AuthModule)
  ],
  controllers: [AdminController],
  providers: [AdminService, RestaurantGuard,AdminRepository],
  exports: [AdminService, AdminRepository],
})
export class AdminModule {}

