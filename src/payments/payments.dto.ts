import { IsNotEmpty } from 'class-validator';
export class PurchasePlanDto {
  @IsNotEmpty()
  price!: number;
}