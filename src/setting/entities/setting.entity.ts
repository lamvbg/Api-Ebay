import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 'default' })
    banner: string;

    @Column({ nullable: true })
    slide: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    ratioPrice: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    ratioDiscount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    weightBasedPrice: number;
}
