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

  async searchItems(categoryId: string): Promise<any> {
    try {
      const accessToken = await this.ebayAuthService.getAccessToken();

      const response = await axios.get(`${this.ebayApiUrl}?category_ids=${categoryId}`, {
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
          newProduct.id = itemId;
          newProduct.name = itemSummary.title;
          newProduct.category = itemSummary.categories;
          newProduct.price = itemSummary.price;
          newProduct.imageUrl = itemSummary.image;

          await this.productRepository.save(newProduct);
        }
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getItem(itemId: string): Promise<any> {
    try {
      const accessToken = await this.ebayAuthService.getAccessToken();

      const response = await axios.get(`https://api.ebay.com/buy/browse/v1/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async searchItemsByUrl(url: string): Promise<any> {
    try {
      // const accessToken = await this.ebayAuthService.getAccessToken();

      const xmlBody = `
        <findItemsByKeywordsRequest xmlns="http://www.ebay.com/marketplace/search/v1/services">
          <url>${url}</url>
          <keywords>dummy_value</keywords>
        </findItemsByKeywordsRequest>
      `;
      const bodyObject = await parseStringPromise(xmlBody, { explicitArray: false });

      const xmlString = new Builder().buildObject(bodyObject);

      const response = await axios.post('https://svcs.ebay.com/services/search/FindingService/v1', xmlString, {
        headers: {
          'Content-Type': 'application/xml',
          // Authorization: `Bearer ${accessToken}`,
          'X-EBAY-SOA-SECURITY-APPNAME': 'BaoLam-Testinga-PRD-df4c997ed-2036660f',
          'X-EBAY-SOA-OPERATION-NAME': 'findItemsByKeywords'
        },
      });

      // console.log(response.data);

      const result = await parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });

      const item = result.findItemsByKeywordsResponse?.searchResult?.item;

      return item;
    } catch (error) {
      throw error;
    }
  }
}
