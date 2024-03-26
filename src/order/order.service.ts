// order/order.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities';
import { OrderDto } from './dto/order.dto';
import { ProductEntity } from 'src/product/entities';
import { UserEntity } from 'src/user/entities';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

    async findAll(): Promise<OrderEntity[]> {
      return this.orderRepository.find({ relations: ["user", "product"] });
    }

  async findOne(id: number): Promise<OrderEntity> {
    return this.orderRepository.findOne({ where: { id }, relations: ["user", "product"]} );
  }  

  async create(orderDto: OrderDto): Promise<OrderEntity> {
    const { productId, quantity, totalPrice, createdAt, userId, shippingFee, warrantyFee } = orderDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    const newOrder = this.orderRepository.create({
        user, // Assigning user object directly
        product,
        quantity: quantity || 1,
        shippingFee,
        warrantyFee,
        totalPrice,
        createdAt
    });

    // Save the newOrder object into the database
    return await this.orderRepository.save(newOrder);
}

  async update(orderId: number, data: Partial<OrderEntity>): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({where: { id: orderId}});
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`)
    }
    if (data.product) {
      const productId = data.product.id;
      const product = await this.productRepository.findOne({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found.`);
      }
      order.product = product;
    }
    Object.assign(order, data)

    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }
}
