// discount/discount.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountEntity } from './entities';
import { JAuthGuard } from 'src/auth/utils/authMiddleWare';
import { RolesGuard } from 'src/auth/utils/role.middleware';

@Controller('discount')
@UseGuards(JAuthGuard, RolesGuard)

export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get()
  findAll(): Promise<DiscountEntity[]> {
    return this.discountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DiscountEntity> {
    return this.discountService.findOne(Number(id));
  }

  @Post()
  create(@Body() discount: Partial<DiscountEntity>): Promise<DiscountEntity> {
    return this.discountService.create(discount);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() discount: Partial<DiscountEntity>): Promise<DiscountEntity> {
    return this.discountService.update(Number(id), discount);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.discountService.delete(Number(id));
  }
}
