// ebay.controller.ts

import { Controller, Get, Query, Param, Post, Patch, HttpException, HttpStatus, Put, Body, NotFoundException } from '@nestjs/common';
import { EbayService } from './product.service';
import { ProductEntity } from './entities';
import { PaginationQueryDto } from './dto/PaginationQueryDto.dto';
import { PaginatedProductsResultDto } from './dto/PaginatedProductsResultDto.dto';

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
  async findAll(@Query() paginationQuery: PaginationQueryDto): Promise<PaginatedProductsResultDto> {
    return this.ebayService.findAll(paginationQuery);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() productData: Partial<ProductEntity>): Promise<ProductEntity> {
    try {
      const updatedProduct = await this.ebayService.updateProduct(id, productData);
      return updatedProduct;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

}
