// product/product.entity.ts

import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'productEntity' })
export class ProductEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column()
  price: string;

  @Column()
  imageUrl: string;
}
