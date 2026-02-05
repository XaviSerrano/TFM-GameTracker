// create-wishlist.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  gameName: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;
}
