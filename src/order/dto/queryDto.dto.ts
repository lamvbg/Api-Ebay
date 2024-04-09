import { Type } from 'class-transformer';
import {IsDateString, IsOptional, IsPositive,} from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit: number = 20;

  phone?: string;
  userName?: string;

  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @IsOptional()
  @IsDateString()
  createdAtTo?: Date;

  paymentStatus? : string;

  deliveryStatus?: string
  
  createdAt: Date;
}
