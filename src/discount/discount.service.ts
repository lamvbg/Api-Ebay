// discount/discount.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountEntity } from './entities';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(DiscountEntity)
    private readonly discountRepository: Repository<DiscountEntity>,
  ) {}

  async findAll(): Promise<DiscountEntity[]> {
    return this.discountRepository.find();
  }

  async findOne(id: number): Promise<DiscountEntity> {
    return this.discountRepository.findOne({where: {id}});
  }

  async create(discount: Partial<DiscountEntity>): Promise<DiscountEntity> {
    return this.discountRepository.save(discount);
  }

  async update(id: number, discount: Partial<DiscountEntity>): Promise<DiscountEntity> {
    await this.discountRepository.update(id, discount);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.discountRepository.delete(id);
  }
}
