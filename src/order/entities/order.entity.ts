// order/order.entity.ts

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user/entities';
import { ProductEntity } from '../../product/entities';

@Entity({ name: 'Order' })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.orders)
  user: UserEntity;

  @ManyToOne(() => ProductEntity, product => product.orders)
  product: ProductEntity;

  @Column()
  quantity: number;

  @Column()
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  warrantyFee: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
