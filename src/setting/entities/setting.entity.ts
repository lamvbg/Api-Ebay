import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    bannerTop: string;

    @Column({ type: 'jsonb', nullable: true, default: {} })
    slide: { slideImg: string }[];
    
    @Column({ nullable: true })
    bannerBot: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    ratioPrice: number;

    @Column({ nullable: true })
    weightBasedPrice: number;
    
    @Column({ type: 'jsonb', nullable: true, default: {} })
    warrantyFees: { duration: number; fee: number }[];

    @Column({ nullable: true })
    bankUrl: string;
    
    @Column({ nullable: true })
    bankInfoName: string;
}
