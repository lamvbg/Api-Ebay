// order/order.controller.ts

import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderEntity } from './entities';
import { OrderDto } from './dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async findAll(): Promise<OrderEntity[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderEntity> {
    return this.orderService.findOne(+id);
  }

  @Post()
  async create(@Param('id') id: string, @Body() orderDto: OrderDto): Promise<OrderEntity> {
    return this.orderService.create(orderDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<OrderEntity>): Promise<OrderEntity> {
    return this.orderService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.orderService.remove(+id);
  }
}
