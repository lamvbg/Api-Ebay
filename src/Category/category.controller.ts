// src/category/category.controller.ts

import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { Category } from './entities';
import { CategoryService } from './category.service';
import { RolesGuard } from 'src/auth/utils/role.middleware';
import { JAuthGuard } from 'src/auth/utils/authMiddleWare';
import { Response } from 'express';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Category> {
    return this.categoryService.findOneById(id);
  }

  @Post()
  @UseGuards(JAuthGuard, RolesGuard)
  async create(@Body() categoryData: Partial<Category>): Promise<Category> {
    return this.categoryService.create(categoryData);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response): Promise<void> {
    try {
      await this.categoryService.remove(id);
      const responseData = { message: `Category with ID ${id} deleted successfully`, status: HttpStatus.OK };
      res.status(HttpStatus.OK).json(responseData);
    } catch (error) {
      const responseData = { message: 'Internal server error', status: HttpStatus.INTERNAL_SERVER_ERROR };
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(responseData);
    }
  }
}
