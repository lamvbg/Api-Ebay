import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../../product/entities';
import { UserEntity } from '../../user/entities';

@Entity({ name: 'Cart' })
export class CartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.cartItems)
  user: UserEntity;

  @ManyToOne(() => ProductEntity, { eager: true })
  product: ProductEntity;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  warrantyFee: number;

}
