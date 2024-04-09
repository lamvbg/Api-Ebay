
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user/entities';
import { OrderItemEntity } from './orderItem.entity';

export enum PaymentStatus {
  NOT_PAID = 'not_paid',
  PARTIALLY_PAID = 'partially_paid',
  FULLY_PAID = 'fully_paid'
}

export enum DeliveryStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

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

  @Column()
  phone: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.NOT_PAID })
  paymentStatus: PaymentStatus;

  @Column({ type: 'enum', enum: DeliveryStatus, nullable: true, default:DeliveryStatus.PENDING })
  deliveryStatus: DeliveryStatus;

  @Column({ nullable: true })
  paymentImg: string;
}
