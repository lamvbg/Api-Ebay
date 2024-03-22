  // product/product.entity.ts

  import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

  @Entity({ name: 'Product' })
  export class ProductEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    category: string;

    @Column({ type: 'jsonb' })
    price: {
      lastUpdated: Date;
      value: number;
    }[];

    @Column({ type: 'json',  nullable: true  })
    additionalImages: string[];

    @Column({ nullable: true})
    condition: string;

    @Column({ type: 'json',  nullable: true  })
    seller: string[];

    @Column({ type: 'json',  nullable: true  })
    thumbnailImages: string[];

    @Column()
    itemWebUrl: string;

    @Column({ type: 'json',  nullable: true  })
    itemLocation: string[];
  }
