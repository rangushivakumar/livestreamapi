import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateCategoryDto, CreateCategoryItemsDto, CreateRestaurantDto, CreateSocialPlatformsDto, CreateWaiterDto, GetCategoriesDto, GetMenuItemsDto, UpdateCategoryDto, UpdateRestaurantDto, UpdateReviewDto, UpdateReviewLinkDto } from './dto/create-restaurant.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/entities/user/user.entity';

@Controller('admin')
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('restaurant')
  @UseGuards(AuthGuard())
  async createRestaurant(
    @Body() body: CreateRestaurantDto,
    @GetUser() user: User
  ) {
    return this.adminService.createRestaurantForAdmin(user, body);
  }

  @Get('restaurant')
  @UseGuards(AuthGuard())
  getMyRestaurant(@GetUser() user: User) {
    return this.adminService.getRestaurantForAdmin(user);
  }

  @Patch('/restaurant/:id')
  @UseGuards(AuthGuard())
  updateRestaurant(
    @Param('id') restaurantId: number,
    @Body() body: UpdateRestaurantDto,
    @GetUser() user: User,
  ) {
    return this.adminService.updateRestaurantForAdmin(
      restaurantId,
      user,
      body,
    );
  }

  @Post('restaurant/review/:id')
  @UseGuards(AuthGuard())
  updateReview(
    @Param('id') restaurantId: number,
    @Body() body: UpdateReviewDto,
    @GetUser() user: User,
  ) {
    return this.adminService.updateReviewForAdmin(restaurantId, user, body);
  }

  @Post('restaurant/review-link/:id')
  @UseGuards(AuthGuard())
  updateReviewLink(
    @Param('id') restaurantId: number,
    @Body() body: UpdateReviewLinkDto,
    @GetUser() user: User,
  ) {
    return this.adminService.updateReviewLinkForAdmin(restaurantId, user, body);
  }

  @Get('restaurant/reviews/:id')
  @UseGuards(AuthGuard())
  getReviews(
    @Param('id') restaurantId: number,
    @GetUser() user: User,
  ) {
    return this.adminService.getReviewsForAdmin(restaurantId, user);
  }

  @Post('category')
  @UseGuards(AuthGuard())
  createCategory(
    @Body() body: CreateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.adminService.createCategoryForAdmin(user, body);
  }

  @Patch('category/:id')
  @UseGuards(AuthGuard())
  updateCategory(
    @Param('id') categoryId: number,
    @Body() body: UpdateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.adminService.updateCategoryForAdmin(categoryId, user, body);
  }

  @Delete('category/:id')
  @UseGuards(AuthGuard())
  deleteCategory(
    @Param('id') categoryId: number,
    @GetUser() user: User,
  ) {
    return this.adminService.deleteCategoryForAdmin(categoryId, user);
  }

  @Get('categories')
  @UseGuards(AuthGuard())
  getCategories(
    @GetUser() user: User,
    @Query() dto: GetCategoriesDto,
  ) {
    return this.adminService.getCategoriesForAdmin(user, dto);
  }

  @Post('category/items')
  @UseGuards(AuthGuard())
  createCategoryItems(
    @Body() body: CreateCategoryItemsDto,
    @GetUser() user: User,
  ) {
    return this.adminService.createCategoryItemsForAdmin(user, body);
  }

  @Patch('category/item/:id')
  @UseGuards(AuthGuard())
  updateCategoryItem(
    @Param('id') itemId: number,
    @Body() body: CreateCategoryItemsDto,
    @GetUser() user: User,
  ) {
    return this.adminService.updateCategoryItemForAdmin(itemId, user, body);
  }

  @Get('/menu/items')
  @UseGuards(AuthGuard())
  getMenuItems(@Query() query: GetMenuItemsDto, @GetUser() user: User) {
    return this.adminService.getMenuItems(query, user);
  }

  @Post('/waiter')
  @UseGuards(AuthGuard())
  createWaiter(
    @Body() body: CreateWaiterDto,
    @GetUser() user: User,
  ) {
    return this.adminService.createWaitersForRestaurant(user, body);
  }

  @Get('/waiters')
  @UseGuards(AuthGuard())
  getWaiters(@GetUser() user: User) {
    return this.adminService.getWaitersForRestaurant(user);
  }

  @Post('social-platforms')
  @UseGuards(AuthGuard())
  createSocialPlatforms(
    @Body() body: CreateSocialPlatformsDto,
    @GetUser() user: User,
  ) {
    return this.adminService.createSocialPlatformsForAdmin(user, body);
  }

  @Get('social-platforms')
  @UseGuards(AuthGuard())
  getSocialPlatforms(@GetUser() user: User) {
    return this.adminService.getSocialPlatformsForAdmin(user);
  }
}

