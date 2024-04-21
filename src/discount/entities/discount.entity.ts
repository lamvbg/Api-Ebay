import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DiscountEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    value: number;
}