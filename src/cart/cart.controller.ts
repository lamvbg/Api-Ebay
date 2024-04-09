import { Controller, Post, Body, Param, Get, Patch, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartEntity } from './entities';
import { AddToCartDto } from './dto/addToCart.dto'
import { JAuthGuard } from 'src/auth/utils/authMiddleWare';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post()
  @UseGuards(JAuthGuard)
  async addToCart(@Param('id') id: string, @Body() addToCartDto: AddToCartDto): Promise<CartEntity> {
    return await this.cartService.addToCart(addToCartDto);
  }

  @Get('items/:userId')
  @UseGuards(JAuthGuard)
  async getAllCartItemsByUserId(@Param('userId') userId: string): Promise<CartEntity[]> {
    return await this.cartService.getAllCartItemsByUserId(userId);
  }

  @Patch('update')
  @UseGuards(JAuthGuard)
  async updateMultipleCartItems(@Body() updates: { cartItemId: number, updatedData: Partial<CartEntity> }[]): Promise<CartEntity[]> {
    return await this.cartService.updateCartItems(updates);
  }

  @Delete('delete/:cartItemId')
  @UseGuards(JAuthGuard)
  async deleteCartItem(@Param('cartItemId') cartItemId: number): Promise<void> {
    return await this.cartService.deleteCartItem(cartItemId);
  }
}
