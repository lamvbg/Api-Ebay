import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { OrderEntity } from './order.entity'; // Đảm bảo điều chỉnh đường dẫn đến thực thể đơn hàng
import { UserEntity } from '../../user/entities';
import { ProductEntity } from '../../product/entities';

@Entity()
export class OrderItemEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // @ManyToOne(type => UserEntity)
    // user: UserEntity;

    @ManyToOne(type => ProductEntity)
    product: ProductEntity;

    @ManyToOne(() => OrderEntity, order => order.orderItems)
    order: OrderEntity;

    @Column()
    quantity: number;

    @Column({ nullable: true })
    warrantyFee: number;

    @Column()
    price: number;
}
