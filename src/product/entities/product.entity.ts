import { Category } from 'src/Category/entities';
import { OrderItemEntity } from 'src/order/entities/orderItem.entity';
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
  marketingPrice: {
    originalPrice: {
      value: string;
      currency: string;
    };
    discountPercentage: string;
    discountAmount: {
      value: string;
      currency: string;
    };
    priceTreatment: string;
  };

  @OneToMany(() => OrderItemEntity, order => order.product)
  orders: OrderItemEntity[];

  @Column({ default: false })
  isUpdated: boolean;
}
