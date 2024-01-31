import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EbayAuthService } from './utils/ebay-auth.service';
import { ProductEntity } from './entities';
import { parseStringPromise, Builder } from 'xml2js'; // Import parseStringPromise và Builder

@Injectable()
export class EbayService {
  private readonly ebayApiUrl = 'https://api.ebay.com/buy/browse/v1/item_summary/search';

  constructor(
    private readonly ebayAuthService: EbayAuthService,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) { }

  async searchItems(category: string): Promise<any> {
    try {
      const accessToken = await this.ebayAuthService.getAccessToken();

      const response = await axios.get(`${this.ebayApiUrl}?q=${category}&limit=2`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log(response.data);

      const itemSummaries = response.data.itemSummaries;

      for (const itemSummary of itemSummaries) {
        const itemId = itemSummary.itemId;
      
        const existingProduct = await this.productRepository.findOne({ where: { id: itemId } });
        
        if (!existingProduct) {
          const newProduct = new ProductEntity();
          const categoryNames = itemSummary.categories.map(category => category.categoryName);
          // const imagesAdd = itemSummary.additionalImages.map(i => i.imageUrl);

          newProduct.id = itemId;
          newProduct.name = itemSummary.title;
          newProduct.category = categoryNames;
          newProduct.price = itemSummary.price.value;
          newProduct.additionalImages = itemSummary.additionalImages;
          newProduct.thumbnailImages = itemSummary.thumbnailImages;
          newProduct.condition = itemSummary.condition;
          newProduct.seller = itemSummary.seller;
          newProduct.itemWebUrl = itemSummary.itemWebUrl;
          newProduct.itemLocation = itemSummary.itemLocation;
      
          await this.productRepository.save(newProduct);
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

async findAll(): Promise<ProductEntity[]> {
  return this.productRepository.find();
}
}
