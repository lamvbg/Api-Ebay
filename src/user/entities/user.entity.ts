import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CartEntity } from 'src/cart/entities';
import { OrderEntity } from 'src/order/entities/order.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  displayName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => OrderEntity, order => order.user)
  orders: OrderEntity[];

  @OneToMany(() => CartEntity, cart => cart.user)
  cartItems: CartEntity[];
}
