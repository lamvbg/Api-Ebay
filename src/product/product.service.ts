import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EbayAuthService } from './utils/ebay-auth.service';
import { ProductEntity } from './entities';
import { parseStringPromise, Builder } from 'xml2js'; // Import parseStringPromise và Builder
import { PaginationQueryDto } from './dto/PaginationQueryDto.dto';
import { PaginatedProductsResultDto } from './dto/PaginatedProductsResultDto.dto';
import { GoogleTranslateService } from './translation.service';
import { CategoryService } from 'src/Category/category.service';

@Injectable()
export class EbayService {
  private readonly ebayApiUrl = 'https://api.ebay.com/buy/browse/v1/item_summary/search';

  constructor(
    private readonly ebayAuthService: EbayAuthService,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly translationService: GoogleTranslateService,
    private categoryService: CategoryService,
  ) { }

  async searchItems(categoryEnglishName: string): Promise<any> {
    try {
      const accessToken = await this.ebayAuthService.getAccessToken();

      const response = await axios.get(`${this.ebayApiUrl}?q=${categoryEnglishName}&limit=50`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const itemSummaries = response.data.itemSummaries;

      for (const itemSummary of itemSummaries) {
        const itemId = itemSummary.itemId;
        const newPriceValue = parseFloat(itemSummary.price.value); // Giả sử giá mới là số

        const existingProduct = await this.productRepository.findOne({ where: { id: itemId } });

        if (!existingProduct) {
          const newProduct = new ProductEntity();
          const category = await this.categoryService.findOneByEnglishName(categoryEnglishName);

          newProduct.id = itemId;
          newProduct.name = itemSummary.title;
          if (!category || typeof category !== 'object') {
            throw new Error(`Category with English name ${categoryEnglishName} not found`);
          }
          newProduct.category = category;

          const newPriceEntry = {
            lastUpdated: new Date(),
            value: newPriceValue
          };
          newProduct.price = [newPriceEntry];

          newProduct.additionalImages = itemSummary.additionalImages;
          newProduct.thumbnailImages = itemSummary.thumbnailImages;
          newProduct.condition = itemSummary.condition;
          newProduct.seller = itemSummary.seller;
          newProduct.itemWebUrl = itemSummary.itemWebUrl;
          newProduct.itemLocation = itemSummary.itemLocation;
          newProduct.marketingPrice = itemSummary.marketingPrice;

          await this.productRepository.save(newProduct);
        } else {
          if (!Array.isArray(existingProduct.price)) {
            existingProduct.price = [];
          }
          const lastPriceEntry = existingProduct.price[existingProduct.price.length - 1];
          const lastPrice = lastPriceEntry ? lastPriceEntry.value : null;

          if (lastPrice !== newPriceValue) {
            const priceUpdate = {
              lastUpdated: new Date(),
              value: newPriceValue
            };
            existingProduct.price.push(priceUpdate);
            await this.productRepository.save(existingProduct);
          }
        }
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getItemAndUpdatePrice(itemId: string): Promise<any> {
    try {
      const accessToken = await this.ebayAuthService.getAccessToken();

      const response = await axios.get(`https://api.ebay.com/buy/browse/v1/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const ebayData = response.data;
      const newPriceValue = ebayData.price.value;

      const product = await this.productRepository.findOne({ where: { id: itemId } });

      if (product) {
        if (!Array.isArray(product.price)) {
          product.price = [];
        }
        const lastPriceEntry = product.price[product.price.length - 1];
        const lastPrice = lastPriceEntry ? lastPriceEntry.value : null;

        // So sánh giá trị giá mới
        if (lastPrice !== newPriceValue) {
          const priceUpdate = {
            lastUpdated: new Date(),
            value: newPriceValue
          };
          product.price.push(priceUpdate);
          await this.productRepository.save(product);
        }
      }

      return ebayData;
    } catch (error) {
      throw error;
    }
  }


  async searchItemById(itemId: string): Promise<any> {
    try {
      const accessToken = await this.ebayAuthService.getAccessToken();

      const xmlBody = `
    <?xml version="1.0" encoding="utf-8"?>
    <GetSingleItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
      <ItemID>${itemId}</ItemID>
    </GetSingleItemRequest>
    `;

      const response = await axios.post('https://open.api.ebay.com/shopping', xmlBody, {
        headers: {
          'Content-Type': 'application/xml',
          'X-EBAY-API-IAF-TOKEN': `Bearer ${accessToken}`,
          'X-EBAY-API-SITE-ID': '0',
          'X-EBAY-API-CALL-NAME': 'GetSingleItem',
          'X-EBAY-API-VERSION': '863',
          'X-EBAY-API-REQUEST-ENCODING': 'xml'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });

      // Modify according to actual response structure
      const item = result.GetSingleItemResponse?.Item;

      return item;
    } catch (error) {
      console.error('Error fetching item by ID:', error);
      throw new Error('Failed to fetch item');
    }
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedProductsResultDto> {
    let { page, limit, minPrice, maxPrice, category, marketingPrice } = paginationQuery;

    page = Number(page);
    limit = Number(limit);
    minPrice = Number(minPrice);
    maxPrice = Number(maxPrice);

    if (!Number.isFinite(page) || page < 1) {
      page = 1;
    }
    if (!Number.isFinite(limit) || limit < 1) {
      limit = 20;
    }

    const offset = (page - 1) * limit;

    // Xây dựng điều kiện lọc theo giá
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (Number.isFinite(minPrice)) {
      queryBuilder.andWhere("CAST(product.price->0->>'value' AS NUMERIC) >= :minPrice", { minPrice });
    }
    if (Number.isFinite(maxPrice)) {
      queryBuilder.andWhere("CAST(product.price->0->>'value' AS NUMERIC) <= :maxPrice", { maxPrice });
    }

    if (category) {
      queryBuilder
        .leftJoin("product.category", "product_category")
        .andWhere("product_category.englishName = :englishName", { englishName: category });
    }

    if (marketingPrice) {
      queryBuilder.andWhere("product.marketingPrice IS NOT NULL");
    }

    const [data, totalCount] = await Promise.all([
      queryBuilder
        .leftJoinAndSelect("product.category", "category")
        .skip(offset)
        .take(limit)
        .getMany(),
      queryBuilder.getCount(),
    ]);


    const translatedData = await Promise.all(data.map(async product => {
      const translatedName = await this.translationService.translateText(product.name, 'vi');
      const translatedCondition = await this.translationService.translateText(product.condition, 'vi');
      return { ...product, name: translatedName, condition: translatedCondition };
    }));


    return {
      data: translatedData,
      page,
      limit,
      totalCount,
    };
  }
}