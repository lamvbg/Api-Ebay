import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'; // Import UUID v4 generator
import { CartEntity } from '../../cart/entities';
import { OrderEntity } from '../../order/entities/order.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') // Set id as PrimaryGeneratedColumn with type 'uuid'
  id: string; // Change id type to string

  @Column()
  email: string;

  @Column()
  displayName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => OrderEntity, order => order.user)
  orders: OrderEntity[];

  @OneToMany(() => CartEntity, cart => cart.user)
  cartItems: CartEntity[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
