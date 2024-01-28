// ebay.controller.ts

import { Controller, Get, Query, Param, Post, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { EbayService } from './product.service';
import { ProductEntity } from './entities';

@Controller('ebay')
export class EbayController {
  constructor(private readonly ebayService: EbayService) { }

  @Get('search')
  async searchItems(@Query('category') category: string) {
    const items = await this.ebayService.searchItems(category);
    return items;
  }

  @Get('item/:itemId')
  async getItem(@Param('itemId') itemId: string): Promise<any> {
    try {
      const productData = await this.ebayService.getItemAndUpdatePrice(itemId);
      return productData;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('searchById/:id')
  async getItemById(@Param('id') id: string) {
    const result = await this.ebayService.searchItemById(id);
    return result;
  }

  @Get()
  async findAll(): Promise<ProductEntity[]> {
    return this.ebayService.findAll();
  }

}
