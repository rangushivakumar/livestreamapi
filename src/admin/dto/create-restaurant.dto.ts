// create-restaurant.dto.ts
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsPhoneNumber, IsNumber, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateRestaurantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  city: string;

  @IsOptional()
  email: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  reviewUrl: string;
}

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  logoUrl?: string;

  @IsOptional()
  reviewUrl?: string;
}

export class UpdateReviewDto {
  @IsNotEmpty()
  @IsString()
  review: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;
}

export class UpdateReviewLinkDto {
  @IsNotEmpty()
  @IsString()
  reviewUrl: string;
}

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class GetCategoriesDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  skip?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreateCategoryItemsDto {
  @IsNotEmpty({ each: true })
  @Type(() => ItemsArrayDto)
  items: ItemsArrayDto[];
}

export class ItemsArrayDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class CreateWaiterDto {
  @IsNotEmpty({ each: true })
  @Type(() => WaitersList)
  waiters: WaitersList[];
}

export class WaitersList {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsPhoneNumber()
  mobile: string;

  @IsNotEmpty()
  @IsString()
  upiId: string;
}

export class CreateSocialPlatformsDto {
  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  youtube?: string;
}


export class GetMenuItemsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}