// category.entity.ts

import { ProductEntity } from 'src/product/entities';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vietnameseName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  englishName: string;

  @OneToMany(() => ProductEntity, product => product.category)
  products: ProductEntity[];
}
