// order/order.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities';
import { OrderDto } from './dto/order.dto';
import { ProductEntity } from 'src/product/entities';
import { UserEntity } from 'src/user/entities';
import { SettingService } from 'src/setting/setting.service';
import { OrderItemEntity } from './entities/orderItem.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private settingService: SettingService,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

    async findAll(): Promise<OrderEntity[]> {
      return this.orderRepository.find({ relations: ["user", "orderItems", "orderItems.product"] });
    }

  async findOne(id: number): Promise<OrderEntity> {
    return this.orderRepository.findOne({ where: { id }, relations: ["user", "orderItems", "orderItems.product"]} );
  }  
  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ["user", "orderItems", "orderItems.product"]
    });

    if (!orders || orders.length === 0) {
      throw new NotFoundException(`Orders for user with ID ${userId} not found.`);
    }

    return orders;
  }

 async create(orderDto: OrderDto, id: number): Promise<OrderEntity> {
    const { products, totalPrice, createdAt, userId, shippingFee, address, phone } = orderDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const orderItems = [];
    for (const productData of products) {
        const { productId, quantity, warrantyFee, price } = productData;
        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found.`);
        }

        const quantityValue = quantity || 1;

        const orderItem = this.orderItemRepository.create({
            user,
            product,
            quantity: quantityValue,
            warrantyFee,
            price
        });
        orderItems.push(orderItem);
    }

    const newOrder = this.orderRepository.create({
        user,
        orderItems: orderItems,
        shippingFee,
        totalPrice,
        address,
        createdAt,
        phone
    });

    return await this.orderRepository.save(newOrder);
}


  async update(orderId: number, data: Partial<OrderEntity>): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    Object.assign(order, data);

    return this.orderRepository.save(order);
}


  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }
}
