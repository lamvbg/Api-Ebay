// ebay.controller.ts

import { Controller, Get, Query, Param } from '@nestjs/common';
import { EbayService } from './product.service';

@Controller('ebay')
export class EbayController {
  constructor(private readonly ebayService: EbayService) {}

  @Get('search')
  async searchItems(@Query('category_ids') categoryId: string) {
    const items = await this.ebayService.searchItems(categoryId);
    return items;
  }

  @Get('item/:itemId')
  async getItem(@Param('itemId') itemId: string) {
    const item = await this.ebayService.getItem(itemId);
    return item;
  }
}
