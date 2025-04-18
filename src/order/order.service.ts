// order/order.service.ts

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities';
import { OrderDto } from './dto/order.dto';
import { ProductEntity } from '../product/entities';
import { UserEntity } from '../user/entities';
import { SettingService } from '../setting/setting.service';
import { OrderItemEntity } from './entities/orderItem.entity';
import { QueryDto } from './dto/queryDto.dto';
import { PaginatedOrdersResultDto } from './dto/PaginationOrdersResultDto.dto';
import { Multer } from 'multer';
import { CloudinaryService } from '../setting/utils/file.service';
import { Setting } from '../setting/entities';
import { CartEntity } from '../cart/entities';
import { CartService } from '../cart/cart.service';
import { DiscountEntity } from '../discount/entities';
import { DiscountService } from '../discount/discount.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private settingService: SettingService,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    private cartService: CartService,
    private discountService: DiscountService,

  ) { }

  async findAll(query: QueryDto): Promise<PaginatedOrdersResultDto> {
    let { page, limit, phone, userName, createdAtFrom, createdAtTo, paymentStatus, deliveryStatus } = query;

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
      .orderBy('order.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (phone) {
      queryBuilder.andWhere('order.phone ILIKE :phone', { phone: `%${phone}%` });
    }

    if (userName) {
      queryBuilder.andWhere('user.displayName ILIKE :userName', { userName: `%${userName}%` });
    }

    if (createdAtFrom) {
      const fromDate = new Date(createdAtFrom);
      fromDate.setUTCHours(0, 0, 0, 0);
      queryBuilder.andWhere('order.createdAt >= :createdAtFrom', { createdAtFrom: fromDate });
    }

    if (createdAtTo) {
      const toDate = new Date(createdAtTo);
      toDate.setUTCHours(23, 59, 59, 999);
      queryBuilder.andWhere('order.createdAt <= :createdAtTo', { createdAtTo: toDate });
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
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .where('user.id = :userId', { userId })
      .orderBy('order.createdAt', 'DESC');

    const orders = await queryBuilder.getMany();
    return orders || [];
  }

  async create(orderDto: OrderDto, id: number): Promise<OrderEntity> {
    const { products, totalPrice, createdAt, userId, shippingFee, address, phone, depositAmount } = orderDto;

    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ["cartItems"] });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    for (const productData of products) {
      const productId = productData.productId;
      await this.cartService.removeCartItemsByProductId(user, productId);
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
      phone,
      depositAmount
    });

    return await this.orderRepository.save(newOrder);
  }

  async update(orderDto: OrderDto, id: number, paymentImage?: Multer.File): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["user", "orderItems", "orderItems.product"]
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    if (orderDto.products) {
      for (const productData of orderDto.products) {
        const orderItem = order.orderItems.find(item => item.product.id === productData.productId);
        if (orderItem) {
          orderItem.quantity = productData.quantity;
          orderItem.warrantyFee = productData.warrantyFee;
          orderItem.price = productData.price;
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
    if (paymentImage) {
      const paymentUrl = await this.uploadAndReturnUrl(paymentImage);
      order.paymentImg = paymentUrl;
    }

    if (orderDto.depositAmount) {
      order.depositAmount = orderDto.depositAmount;
    }

    if (orderDto.discountCode) {
      order.discountCode = orderDto.discountCode;
    }

    await this.orderRepository.save(order);

    return order;
  }

  async updatePaymentImg(id: number, paymentImage: Multer.File): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["user", "orderItems", "orderItems.product"]
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    if (paymentImage) {
      const paymentUrl = await this.uploadAndReturnUrl(paymentImage);
      order.paymentImg = paymentUrl;
      await this.orderRepository.save(order);
    } else {
      throw new BadRequestException('Payment image is required for updating.');
    }

    return order;
  }

  async getDiscountByCode(discountCode: string): Promise<{ }> {
    const discounts = await this.discountService.findAll();
    const discount = discounts.find(discount => discount.code === discountCode);

    if (discount) {
      return {discount};
    } else {
      return {};
    }
  }
  
  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }


  private async uploadAndReturnUrl(file: Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }
}
