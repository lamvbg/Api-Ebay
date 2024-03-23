// product/product.entity.ts

import { Category } from 'src/Category/entities';
import { OrderEntity } from 'src/order/entities/order.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Product' })
export class ProductEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Category, category => category.products, { eager: true })
  category: Category;

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
