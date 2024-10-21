// ebay.controller.ts

import { Controller, Get, Query, Param, Post, Patch, HttpException, HttpStatus, Put, Body, NotFoundException, UseGuards, BadRequestException, Delete } from '@nestjs/common';
import { EbayService } from './product.service';
import { ProductEntity } from './entities';
import { PaginationQueryDto } from './dto/PaginationQueryDto.dto';
import { PaginatedProductsResultDto } from './dto/PaginatedProductsResultDto.dto';
import { JAuthGuard } from '../auth/utils/authMiddleWare';
import { RolesGuard } from '../auth/utils/role.middleware';
import { CategoryService } from 'src/Category/category.service';

@Controller('ebay')
export class EbayController {
  constructor(private readonly ebayService: EbayService,
    private readonly categoryService: CategoryService,
  ) { }

  @Post('search')
  @UseGuards(JAuthGuard, RolesGuard)
  async searchItems(@Body() body: { storeName: string; category?: string; keywords: string }): Promise<any> {
    const { storeName, category, keywords } = body;
    const items = await this.ebayService.searchItemsByStore(storeName, category, keywords);
    await this.ebayService.fetchAndStoreItemDetails(items);
    return items;
  }

  @Post('search-by-ids')
  @UseGuards(JAuthGuard, RolesGuard)
  async searchItemsById(@Body() body: { itemIds: string[], category: string, storeName: string, keywords: string }): Promise<any> {
    const { itemIds, category, storeName, keywords } = body;
    const items = await this.ebayService.searchItemsById(itemIds, category, storeName, keywords);
    return items;
  }

  @Post('searchById')
  @UseGuards(JAuthGuard, RolesGuard)
  async searchItem(@Body() body: { id: string; category?: string }): Promise<any> {
    const { id, category } = body;
    return await this.ebayService.searchItemById(id, category);
  }

  @Get('searchById/:id')
  async getItem(@Param('id') id: string) {
    return await this.ebayService.getItemById(id);
  }

  @Get('searchItem/:id')
  async getItemById(@Param('id') id: string) {
    return await this.ebayService.searchItem(id);
  }

  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto): Promise<PaginatedProductsResultDto> {
    return this.ebayService.findAll(paginationQuery);
  }

  @Put(':id')
  @UseGuards(JAuthGuard, RolesGuard)
  async updateProduct(@Param('id') id: string, @Body() productData: Partial<ProductEntity>): Promise<ProductEntity> {
    try {
      const updatedProduct = await this.ebayService.updateProduct(id, productData);
      return updatedProduct;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(JAuthGuard, RolesGuard)
  async removeProduct(@Param('id') id: string): Promise<void> {
    return await this.ebayService.removeProduct(id);
  }

}
