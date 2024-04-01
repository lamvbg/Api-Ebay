// src/category/category.controller.ts

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Category } from './entities';
import { CategoryService } from './category.service';
import { RolesGuard } from 'src/auth/utils/role.middleware';
import { JAuthGuard } from 'src/auth/utils/authMiddleWare';

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
  @UseGuards(JAuthGuard, RolesGuard)
  async remove(@Param('id') id: number): Promise<{ message: string }> {
      await this.categoryService.remove(id);
      return { message: `Category with ID ${id} deleted successfully` };
  }
}
