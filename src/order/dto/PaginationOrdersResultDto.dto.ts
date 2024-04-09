import { OrderEntity } from "../entities";

export class PaginatedOrdersResultDto {
    data: OrderEntity[];
    page: number;
    limit: number;
    totalCount: number;
  }
  