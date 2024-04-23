// src/category/category.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities';
import { GoogleTranslateService } from '../product/translation.service';
import { ProductEntity } from '../product/entities';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private translationService: GoogleTranslateService,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findOneById(id: number): Promise<Category> {
    return await this.categoryRepository.findOne({ where: { id } });
  }

  async findOneByEnglishName(englishName: string): Promise<Category> {
    return await this.categoryRepository.findOne({ where: { englishName } });
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    if (categoryData.vietnameseName) {
      const englishName = await this.translationService.translateText(categoryData.vietnameseName, 'en');
      categoryData.englishName = englishName;
    }
    
    const category = this.categoryRepository.create(categoryData);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<any> {
    const productsInCategory = await this.productRepository.find({ where: { category: { id } } });
    if (productsInCategory.length > 0) {
        await this.productRepository.delete({ category: { id } });
    }
    await this.categoryRepository.delete(id);
}
  
}
