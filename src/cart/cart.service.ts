import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from './entities';
import { ProductEntity } from '../product/entities';
import { UserEntity } from 'src/user/entities';
import { AddToCartDto } from './dto/addToCart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

 
  async addToCart(addToCartDto: AddToCartDto): Promise<CartEntity> {
    const { userId, productId, quantity, totalPrice } = addToCartDto;
    let cartItem = await this.cartRepository.findOne({ where: { user: { id: userId }, product: { id: productId } } });

    if (cartItem) {
      cartItem.quantity += quantity || 1;
      cartItem.totalPrice += totalPrice;
      return await this.cartRepository.save(cartItem);
    } else {
      const newCartItem = this.cartRepository.create({
        user: { id: userId },
        product: { id: productId },
        quantity: quantity || 1,
        totalPrice
      });
      return await this.cartRepository.save(newCartItem);
    }
  }

  async getAllCartItemsByUserId(userId: string): Promise<CartEntity[]> {
    return await this.cartRepository.find({ where: { user: { id: userId } }, relations: ['product'] });
  }

  async updateCartItem(cartItemId: number, updatedData: Partial<CartEntity>): Promise<CartEntity> {
    const cartItem = await this.cartRepository.findOne({ where: { id: cartItemId } });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found.`);
    }

    // Kiểm tra xem có cập nhật thông tin sản phẩm không
    if (updatedData.product) {
      const productId = updatedData.product.id;
      const product = await this.productRepository.findOne({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found.`);
      }
      cartItem.product = product;
    }

    // Cập nhật thông tin khác của cartItem
    Object.assign(cartItem, updatedData);

    return await this.cartRepository.save(cartItem);
  }

  async deleteCartItem(cartItemId: number): Promise<void> {
    const cartItem = await this.cartRepository.findOne({ where: { id: cartItemId } });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found.`);
    }
    await this.cartRepository.remove(cartItem);
  }
}
