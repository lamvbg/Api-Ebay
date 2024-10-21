import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit: number = 20;

  minPrice?: number;
  maxPrice?: number;

  category?: string;

  marketingPrice? : string[];

  condition?: string;

  conditionOrder?: string;

  @IsOptional()
  @IsIn(['createdAt', 'price'])
  sortField?: string;

  @IsOptional()
  @IsIn(['ascend', 'descend'])
  sortDirection?: string;

  name?: string;

  keywords?: string;
}
