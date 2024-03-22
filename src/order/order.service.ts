// order/order.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async findAll(): Promise<OrderEntity[]> {
    return this.orderRepository.find();
  }

  async findOne(id: number): Promise<OrderEntity> {
    return this.orderRepository.findOne({ where: { id } });
  }  

  async create(data: Partial<OrderEntity>): Promise<OrderEntity> {
    return this.orderRepository.save(data);
  }

  async update(id: number, data: Partial<OrderEntity>): Promise<OrderEntity> {
    await this.orderRepository.update(id, data);
    return this.orderRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }
}
