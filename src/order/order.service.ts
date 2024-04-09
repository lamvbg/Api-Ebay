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
import { QueryDto } from './dto/queryDto.dto';
import { PaginatedOrdersResultDto } from './dto/PaginationOrdersResultDto.dto';

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
  ) { }

  async findAll(query: QueryDto): Promise<PaginatedOrdersResultDto> {
    let { page, limit, phone, userName, createdAt, paymentStatus, deliveryStatus } = query;

    page = Number(page);
    limit = Number(limit);

    if (!Number.isFinite(page) || page < 1) {
      page = 1;
    }
    if (!Number.isFinite(limit) || limit < 1) {
      limit = 20;
    }

    const offset = (page - 1) * limit;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .skip(offset)
      .take(limit);

    if (phone) {
      queryBuilder.andWhere('order.phone = :phone', { phone });
    }

    if (userName) {
      queryBuilder.andWhere('user.displayName = :userName', { userName });
    }

    if (createdAt) {
      queryBuilder.andWhere('order.createdAt = :createdAt', { createdAt });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    }

    if (deliveryStatus) {
      queryBuilder.andWhere('order.deliveryStatus = :deliveryStatus', { deliveryStatus });
    }

    const [data, totalCount] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalCount,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<OrderEntity> {
    return this.orderRepository.findOne({ where: { id }, relations: ["user", "orderItems", "orderItems.product"] });
  }
  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ["user", "orderItems", "orderItems.product"]
    });
    return orders || [];
  }

  async create(orderDto: OrderDto, id: number): Promise<OrderEntity> {
    const { products, totalPrice, createdAt, userId, shippingFee, address, phone } = orderDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (user.address === null) {
      user.address = address;
    }
    if (user.phone === null) {
      user.phone = phone;
    }

    await this.userRepository.save(user);

    const orderItems = [];
    for (const productData of products) {
      const { productId, quantity, warrantyFee, price } = productData;
      const product = await this.productRepository.findOne({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found.`);
      }

      const quantityValue = quantity || 1;

      const orderItem = this.orderItemRepository.create({
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

  async update(orderDto: OrderDto, id: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["user", "orderItems", "orderItems.product"]
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    if (orderDto.products) {
      for (const productData of orderDto.products) {
        // Tìm OrderItem tương ứng trong order.orderItems
        const orderItem = order.orderItems.find(item => item.product.id === productData.productId);
        if (orderItem) {
          // Cập nhật thông tin của OrderItem
          orderItem.quantity = productData.quantity;
          orderItem.warrantyFee = productData.warrantyFee;
          orderItem.price = productData.price;
          // Lưu lại thay đổi trong orderItem
          await this.orderItemRepository.save(orderItem);
        } else {
        }
      }
    }

    if (orderDto.paymentStatus) {
      order.paymentStatus = orderDto.paymentStatus;
    }
    if (orderDto.deliveryStatus) {
      order.deliveryStatus = orderDto.deliveryStatus;
    }
    if (orderDto.totalPrice) {
      order.totalPrice = orderDto.totalPrice;
    }
    if (orderDto.shippingFee) {
      order.shippingFee = orderDto.shippingFee;
    }
    if (orderDto.address) {
      order.address = orderDto.address;
    }
    if (orderDto.phone) {
      order.phone = orderDto.phone;
    }
    if (orderDto.userId) {
      order.user.id = orderDto.userId;
    }

    await this.orderRepository.save(order);

    return order;
  }



  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }
}
