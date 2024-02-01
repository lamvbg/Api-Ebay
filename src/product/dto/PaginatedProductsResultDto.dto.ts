import { ProductEntity } from "../entities";

export class PaginatedProductsResultDto {
    data: ProductEntity[];
    page: number;
    limit: number;
    totalCount: number;
  }
  