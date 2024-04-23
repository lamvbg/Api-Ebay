import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from './entities';
import { ProductEntity } from '../product/entities';
import { UserEntity } from '../user/entities';
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
  ) { }


  async addToCart(addToCartDto: AddToCartDto): Promise<CartEntity> {
    const { userId, productId, quantity, warrantyFee } = addToCartDto;
    const product = await this.productRepository.findOne({ where: { id: productId } });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }
  
    // Lấy tất cả các mục trong giỏ hàng của người dùng có cùng productId
    const cartItems = await this.cartRepository.find({ where: { user: { id: userId }, product: { id: productId } } });
  
    // Kiểm tra xem có mục nào có warrantyFee giống với warrantyFee từ addToCartDto không
    const existingCartItem = cartItems.find(item => item.warrantyFee === warrantyFee);
  
    if (existingCartItem) {
      // Nếu có, chỉ tăng số lượng
      existingCartItem.quantity += quantity || 1;
      return await this.cartRepository.save(existingCartItem);
    } else {
      // Nếu không, tạo một mục mới
      const newCartItem = this.cartRepository.create({
        user: { id: userId },
        product: { id: productId },
        quantity: quantity || 1,
        warrantyFee
      });
      return await this.cartRepository.save(newCartItem);
    }
  }
  
  

  async getAllCartItemsByUserId(userId: string): Promise<CartEntity[]> {
    return await this.cartRepository.find({ where: { user: { id: userId } }, relations: ['product'] });
  }

  async updateCartItems(updates: { cartItemId: number, updatedData: Partial<CartEntity> }[]): Promise<CartEntity[]> {
    const updatedCartItems: CartEntity[] = [];

    for (const update of updates) {
        const { cartItemId, updatedData } = update;
        const cartItem = await this.cartRepository.findOne({ where: { id: cartItemId } });

        if (!cartItem) {
            throw new NotFoundException(`Cart item with ID ${cartItemId} not found.`);
        }

        if (updatedData.product) {
            const productId = updatedData.product.id;
            const product = await this.productRepository.findOne({ where: { id: productId } });
            if (!product) {
                throw new NotFoundException(`Product with ID ${productId} not found.`);
            }
            cartItem.product = product;
        }

        Object.assign(cartItem, updatedData);

        const updatedCartItem = await this.cartRepository.save(cartItem);
        updatedCartItems.push(updatedCartItem);
    }

    return updatedCartItems;
}

  async deleteCartItem(cartItemId: number): Promise<void> {
    const cartItem = await this.cartRepository.findOne({ where: { id: cartItemId } });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found.`);
    }
    await this.cartRepository.remove(cartItem);
  }

  async removeCartItemsByProductId(user: UserEntity, productId: string): Promise<void> {
    const cartItemsToRemove = user.cartItems.filter(cartItem => cartItem.product.id === productId);
    await this.cartRepository.remove(cartItemsToRemove);
  }
}
