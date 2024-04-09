import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

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

  createdAt?: Date;

  paymentStatus? : string;

  deliveryStatus?: string
}
