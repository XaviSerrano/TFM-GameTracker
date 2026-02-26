// create-wishlist.dto.ts
import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  gameName: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  released?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];
}
