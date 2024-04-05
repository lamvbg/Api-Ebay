// order/order.controller.ts

import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, NotFoundException, UnauthorizedException, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderEntity } from './entities';
import { OrderDto } from './dto/order.dto';
import { RolesGuard } from 'src/auth/utils/role.middleware';
import { JAuthGuard } from 'src/auth/utils/authMiddleWare';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get()
  @UseGuards(JAuthGuard, RolesGuard)
  async findAll(): Promise<OrderEntity[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  @UseGuards(JAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string): Promise<OrderEntity> {
    return this.orderService.findOne(+id);
  }

  @Get('user/:userId')
  @UseGuards(JAuthGuard)
  async findByUserId(@Param('userId') userId: string, @Req() request) {
    try {
      const orders = await this.orderService.findByUserId(userId);

      const authenticatedUserId = request.user.sub;
      console.log(authenticatedUserId);

      if (authenticatedUserId != userId) {
        throw new UnauthorizedException('You are not authorized to view this resource.');
      }
      return orders;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Internal Server Error');
    }
  }

  @Post()
  @UseGuards(JAuthGuard)
  async create(@Body() orderDto: OrderDto, @Req() request): Promise<OrderEntity> {
    try {
      const authenticatedUserId = request.user.sub;

      if (authenticatedUserId !== orderDto.userId) {
        throw new UnauthorizedException('You are not authorized to create this order.');
      }

      return this.orderService.create(orderDto, authenticatedUserId);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Internal Server Error');
    }
  }

  @Put(':id')
  @UseGuards(JAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() orderDto: OrderDto): Promise<OrderEntity> {
    return this.orderService.update(orderDto, +id); 
  }

  @Delete(':id')
  @UseGuards(JAuthGuard, RolesGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.orderService.remove(+id);
  }
}
