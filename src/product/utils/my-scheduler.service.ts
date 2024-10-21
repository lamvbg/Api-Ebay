import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EbayService } from '../product.service';

@Injectable()
export class MySchedulerService {
  constructor(
    private readonly ebayService: EbayService,
  ) {}

  @Cron(CronExpression.EVERY_4_HOURS)
  async handleCron() {
    try {
      const allProducts = await this.ebayService.findProducts();

      const productGroups = new Map<string, { itemIds: string[], category: string, storeName: string, keywords: string }>();
      const processedCategories = new Set<string>();

      for (const product of allProducts) {
        const key = `${product.category.englishName}_${product.storeName}_${product.keywords}`;
        
        if (!productGroups.has(key)) {
          productGroups.set(key, { itemIds: [], category: product.category.englishName, storeName: product.storeName, keywords: product.keywords });
        }
        
        productGroups.get(key).itemIds.push(product.id);
      }

      for (const { itemIds, category, storeName, keywords } of productGroups.values()) {
        const uniqueKey = `${category}_${storeName}_${keywords}`;
        
        if (!processedCategories.has(uniqueKey)) {
          processedCategories.add(uniqueKey);

          for (let i = 0; i < itemIds.length; i += 20) {
            const batch = itemIds.slice(i, i + 20);
            await this.ebayService.searchItemsById(batch, category, storeName, keywords);
          }
        }
      }

      console.log('Search executed successfully');
    } catch (error) {
      console.error('Error executing search:', error);
    }
  }
}
