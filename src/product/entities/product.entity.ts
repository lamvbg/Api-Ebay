import { Exclude } from 'class-transformer';
import { Category } from '../../Category/entities';
import { OrderItemEntity } from '../../order/entities/orderItem.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export enum ConditionEnum {
  PRE_ORDER = 'Pre Order',
  NEW = 'New',
  OPEN_BOX = 'Open Box',
  Refurbished= 'Refurbished',
  Used = 'Used'
}

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

  @Column({ type: 'enum', enum: ConditionEnum, default: ConditionEnum.PRE_ORDER })
  conditionOrder : ConditionEnum;

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

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  @Exclude()
  createdAt: Date;

  // @Column({ default: false })
  // isUpdated: boolean;
}
