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
  additionalImages: string[];

  @Column()
  condition: string;

  @Column({ type: 'json' })
  seller: string[];

  @Column({ type: 'json' })
  thumbnailImages: string[];

  @Column()
  itemWebUrl: string;

  @Column({ type: 'json' })
  itemLocation: string[];
}
