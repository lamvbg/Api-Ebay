// product/product.entity.ts

import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Product' })
export class ProductEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ type: 'json' })
  category: string[];

  @Column({ type: 'json' })
  price: {
    lastUpdated: Date;
    value: number;
  }[];

  @Column({ type: 'json' })
  imageUrl: string[];
}
