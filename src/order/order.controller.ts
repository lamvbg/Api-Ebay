// order/order.controller.ts

import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, NotFoundException, UnauthorizedException, Req, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderEntity } from './entities';
import { OrderDto } from './dto/order.dto';
import { RolesGuard } from '../auth/utils/role.middleware';
import { JAuthGuard } from '../auth/utils/authMiddleWare';
import { QueryDto } from './dto/queryDto.dto';
import { PaginatedOrdersResultDto } from './dto/PaginationOrdersResultDto.dto';
import { Multer } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Setting } from '../setting/entities';
import { SettingService } from '../setting/setting.service';


@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly settingService: SettingService
  ) { }

  @Get()
  @UseGuards(JAuthGuard, RolesGuard)
  async findAll(@Query() query: QueryDto): Promise<PaginatedOrdersResultDto> {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JAuthGuard)
  async findOne(@Param('id') id: number): Promise<OrderEntity> {
    return this.orderService.findOne(id);
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

  @Post('discountCode')
  async addDiscountCode(
    @Param('id') orderId: number,
    @Body('discountCode') discountCode: string,
  ): Promise<{  }> {
    return this.orderService.getDiscountByCode(discountCode);
  }

  @Put(':id')
  @UseGuards(JAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('paymentImg'))
  async update(
    @Param('id') id: string, 
    @Body() orderDto: OrderDto,
    @UploadedFile() paymentImg?: Multer.File,
  ): Promise<OrderEntity> {
    return this.orderService.update(orderDto, +id, paymentImg ); 
  }

  @Put('payment/:id')
  @UseGuards(JAuthGuard)
  @UseInterceptors(FileInterceptor('paymentImg'))
  async updatePaymentImg(
    @Param('id') id: string, 
    @UploadedFile() paymentImg?:Multer.File,
  ): Promise<OrderEntity> {

    return this.orderService.updatePaymentImg(+id, paymentImg); 
  }
  
  @Delete(':id')
  @UseGuards(JAuthGuard, RolesGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.orderService.remove(+id);
  }
}
