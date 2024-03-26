import { CartEntity } from 'src/cart/entities';
import { OrderEntity } from 'src/order/entities/order.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  displayName: string;

  @OneToMany(() => OrderEntity, order => order.user)
  orders: OrderEntity[];

  @OneToMany(() => CartEntity, cart => cart.user)
  cartItems: CartEntity[];
  
}
