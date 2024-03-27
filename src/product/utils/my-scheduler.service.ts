import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EbayService } from '../product.service';
import { CategoryService } from '../../Category/category.service';

@Injectable()
export class MySchedulerService {
  constructor(
    private readonly ebayService: EbayService,
    private readonly categoryService: CategoryService,
    ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron() {
    try {
        const categories = await this.categoryService.findAll();
        for (const category of categories) {
          await this.ebayService.searchItems(category.englishName);
        }
        console.log('Search executed successfully');
      } catch (error) {
        console.error('Error executing search:', error);
      }
    }
}
