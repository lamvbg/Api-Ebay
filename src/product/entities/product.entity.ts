// product/product.entity.ts

import { OrderEntity } from 'src/order/entities/order.entity';
import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Product' })
export class ProductEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column({ type: 'jsonb' })
  price: {
    lastUpdated: Date;
    value: number;
  }[];

  @Column({ type: 'json', nullable: true })
  additionalImages: string[];

  @Column({ nullable: true })
  condition: string;

  @Column({ type: 'json', nullable: true })
  seller: string[];

  @Column({ type: 'json', nullable: true })
  thumbnailImages: string[];

  @Column()
  itemWebUrl: string;

  @Column({ type: 'json', nullable: true })
  itemLocation: string[];

  @Column({ type: 'json', nullable: true })
  marketingPrice: string[];

  @OneToMany(() => OrderEntity, order => order.product)
  orders: OrderEntity[];
}
