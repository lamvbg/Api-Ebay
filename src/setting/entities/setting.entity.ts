import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'jsonb', nullable: true, default: {} })
    bannerTop: { bannerTopImg: string }[];

    @Column({ type: 'jsonb', nullable: true, default: {} })
    slide: { slideImg: string }[];
    
    @Column({ type: 'jsonb', nullable: true, default: {} })
    bannerBot: { bannerBotImg: string }[];

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    ratioPrice: number;

    @Column({ nullable: true })
    shippingFee: number;

    @Column({ nullable: true })
    weightBasedPrice: number;
    
    @Column({ type: 'jsonb', nullable: true, default: {} })
    warrantyFees: { [key: string]: number };
}
