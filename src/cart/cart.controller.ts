import { Controller, Post, Body, Param, Get, Patch, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartEntity } from './entities';
import {AddToCartDto} from './dto/addToCart.dto'

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post(':userId/add')
async addToCart(@Param('userId') userId: number, @Body() addToCartDto: AddToCartDto): Promise<CartEntity> {
    return await this.cartService.addToCart(userId, addToCartDto);
}

  @Get(':userId/items')
  async getAllCartItemsByUserId(@Param('userId') userId: number): Promise<CartEntity[]> {
    return await this.cartService.getAllCartItemsByUserId(userId);
  }

  @Patch(':cartItemId/update')
  async updateCartItem(@Param('cartItemId') cartItemId: number, @Body() updatedData: Partial<CartEntity>): Promise<CartEntity> {
    return await this.cartService.updateCartItem(cartItemId, updatedData);
  }

  @Delete(':cartItemId/delete')
  async deleteCartItem(@Param('cartItemId') cartItemId: number): Promise<void> {
    return await this.cartService.deleteCartItem(cartItemId);
  }
}
