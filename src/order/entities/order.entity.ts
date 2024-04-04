
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user/entities';
import { OrderItemEntity } from './orderItem.entity';

@Entity({ name: 'Order' })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.orders)
  user: UserEntity;

  @OneToMany(() => OrderItemEntity, orderItem => orderItem.order, { cascade: true })
  orderItems: OrderItemEntity[];

  @Column()
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shippingFee: number;


  @Column({ nullable: true })
  address: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
