import { Injectable, NotFoundException } from '@nestjs/common';
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
import { SettingService } from 'src/setting/setting.service';
import { Setting } from 'src/setting/entities';
import { MailService } from './sendmail.service';
import * as fs from 'fs';
import { promisify } from 'util';
import * as handlebars from 'handlebars';
import { CartEntity } from 'src/cart/entities';
import { query } from 'express';
import { isEmail } from 'class-validator';
import { OrderItemEntity } from 'src/order/entities/orderItem.entity';

@Injectable()
export class EbayService {
  private readFile = promisify(fs.readFile);
  private readonly ebayApiUrl = 'https://api.ebay.com/buy/browse/v1/item_summary/search';

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly ebayAuthService: EbayAuthService,
    private readonly translationService: GoogleTranslateService,
    private categoryService: CategoryService,
    private settingService: SettingService,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly mailService: MailService,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) { }


  async searchItemsByStore(storeName: string, categoryEnglishName?: string, keywords?: string): Promise<any> {
    let totalItems = [];
    if (!categoryEnglishName) {
      throw new Error('Category name is required for searching items.');
    }

    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
      <findItemsIneBayStoresRequest xmlns="http://www.ebay.com/marketplace/search/v1/services">
        <storeName>${storeName}</storeName>
        <keywords>${keywords}</keywords>
        <sortOrder>StartTimeNewest</sortOrder>
        <paginationInput>
          <entriesPerPage>100</entriesPerPage>
        </paginationInput>
        <outputSelector>DiscountPriceInfo</outputSelector>
        <outputSelector>PictureURLLarge</outputSelector>
        <outputSelector>StoreInfo</outputSelector>
        <itemFilter>
          <name>MinQuantity</name>
          <value>1</value>
        </itemFilter>
      </findItemsIneBayStoresRequest>`;

    try {
      const response = await axios.post('https://svcs.ebay.com/services/search/FindingService/v1', xmlRequest, {
        headers: {
          'Content-Type': 'application/xml',
          'X-EBAY-SOA-OPERATION-NAME': 'findItemsIneBayStores',
          'X-EBAY-SOA-SECURITY-APPNAME': process.env.EBAY_CLIENT_ID,
          'X-EBAY-SOA-SERVICE-VERSION': '1.0.0',
          'X-EBAY-SOA-REQUEST-DATA-FORMAT': 'XML',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      const result = await parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
      const items = result.findItemsIneBayStoresResponse.searchResult.item;
      totalItems = totalItems.concat(items);

      return totalItems.map(item => ({
        id: item.itemId,
        category: categoryEnglishName,
        storeName: storeName,
        keywords: keywords,
      }));
    } catch (error) {
      console.error('Error fetching items from eBay:', error);
      throw error;
    }
  }

  async fetchAndStoreItemDetails(items: { id: string; category: string; storeName: string; keywords: string }[]) {
    try {
      const chunkSize = 20;
      const itemChunks = [];

      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        itemChunks.push(chunk);
      }

      for (const chunk of itemChunks) {
        const itemIds = chunk.map(item => item.id);
        await this.searchItemsById(itemIds, chunk[0].category, chunk[0].storeName, chunk[0].keywords);
      }
    } catch (error) {
      console.error('Error fetching and storing item details:', error);
      throw error;
    }
  }

  async searchItemsById(itemIds: string[], categoryEnglishName: string, storeName: string, keywords: string): Promise<any> {
    try {
      const accessToken = await this.ebayAuthService.getAccessToken();

      const xmlBody = `
        <?xml version="1.0" encoding="utf-8"?>
        <GetMultipleItemsRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            ${itemIds.map(id => `<ItemID>${id}</ItemID>`).join('')}
            <IncludeSelector>Details,Description,ItemSpecifics,ShippingCosts,TextDescription,Variations</IncludeSelector>
        </GetMultipleItemsRequest>
        `;

      const response = await axios.post('https://open.api.ebay.com/shopping', xmlBody, {
        headers: {
          'Content-Type': 'application/xml',
          'X-EBAY-API-IAF-TOKEN': accessToken,
          'X-EBAY-API-SITE-ID': '0',
          'X-EBAY-API-CALL-NAME': 'GetMultipleItems',
          'X-EBAY-API-VERSION': '863',
          'X-EBAY-API-REQUEST-ENCODING': 'xml'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });

      const items = result.GetMultipleItemsResponse?.Item;

      if (!items) {
        return;
      }

      for (const item of items) {
        const newPriceValue = parseFloat(item?.ConvertedCurrentPrice);
        if (isNaN(newPriceValue)) {
          throw new Error(`Invalid item price for item with ID ${item.ItemID}`);
        }

        const oldRatioPrice = await this.settingService.getRatioPrice();
        const newPrice = newPriceValue * oldRatioPrice + 1300;

        let product = await this.productRepository.findOne({ where: { id: item.ItemID } });

        const originalRetailPriceValue = item.DiscountPriceInfo?.OriginalRetailPrice
          ? parseFloat(item.DiscountPriceInfo.OriginalRetailPrice) * oldRatioPrice
          : null;

        const discountPercentage = originalRetailPriceValue !== null
          ? 100 - ((newPriceValue / item.DiscountPriceInfo?.OriginalRetailPrice) * 100)
          : null;

        const discountAmount = originalRetailPriceValue !== null
          ? originalRetailPriceValue - newPrice
          : null;

        const newMarketingPriceEntry = originalRetailPriceValue !== null
          ? {
            originalPrice: {
              value: originalRetailPriceValue.toFixed(2),
              currency: "VND",
            },
            discountPercentage: discountPercentage.toFixed(2),
            discountAmount: {
              value: discountAmount.toFixed(2),
              currency: "VND",
            },
            priceTreatment: item.PriceTreatment || "NONE",
          }
          : null;

        const quantityAvailable = item.Quantity - item.QuantitySold;
        if (product) {
          if (product.quantity !== quantityAvailable) {
            product.quantity = quantityAvailable;
            await this.productRepository.save(product);
          }
        }

        if (!product) {
          const category = await this.categoryService.findOneByEnglishName(categoryEnglishName);
          if (!category) {
            throw new Error('Category not found');
          }
          product = new ProductEntity();
          product.id = item.ItemID;
          product.name = item.Title;
          product.isUpdated = false;
          product.itemWebUrl = item.ViewItemURLForNaturalSearch;
          product.itemLocation = item.Location || null;
          product.thumbnailImages = item.GalleryURL || item.PictureURL[0];
          product.additionalImages = item.PictureURL;
          product.condition = item.ConditionDisplayName;
          product.localizedAspects = item.ItemSpecifics?.NameValueList || [];
          product.brand = this.getBrandFromLocalizedAspects(item.ItemSpecifics?.NameValueList || null);
          product.description = item.Description;
          product.quantity = quantityAvailable;
          product.category = category;
          product.storeName = storeName;
          product.keywords = keywords;

          const newPriceEntry = {
            lastUpdated: new Date(),
            value: newPrice
          };

          product.price = [newPriceEntry];
          product.marketingPrice = newMarketingPriceEntry;
          await this.productRepository.save(product);
        } else {
          if (product.isUpdated) {
            console.log(`Product with ID ${item.ItemID} has been updated recently. Skipping price update.`);
            continue;
          }

          if (!Array.isArray(product.price)) {
            product.price = [];
          }

          const lastPriceEntry = product.price[product.price.length - 1];
          const lastPrice = lastPriceEntry ? lastPriceEntry.value : null;

          if (!isNaN(newPriceValue)) {
            const oldRatioPrice = await this.settingService.getRatioPrice();
            const newPrice = newPriceValue * oldRatioPrice + 1300;

            if (lastPrice !== newPrice) {
              const priceUpdate = {
                lastUpdated: new Date(),
                value: newPrice
              };
              product.price.push(priceUpdate);
              await this.productRepository.save(product);
              await this.sendPriceNotificationEmail(item.ItemID, product.name, newPrice);
            }
          } else {
            console.error(`Invalid current price or ratio price for product with ID ${item.ItemID}`);
          }

          if (product && product.marketingPrice && product.marketingPrice.originalPrice && product.marketingPrice.originalPrice.value && product.marketingPrice.originalPrice.value !== (item.DiscountPriceInfo?.OriginalRetailPrice * oldRatioPrice).toFixed(2)) {
            const originalRetailPriceValue = item.DiscountPriceInfo?.OriginalRetailPrice
              ? parseFloat(item.DiscountPriceInfo.OriginalRetailPrice) * oldRatioPrice
              : null;

            const discountPercentage = originalRetailPriceValue !== null
              ? 100 - ((newPriceValue / item.DiscountPriceInfo?.OriginalRetailPrice) * 100)
              : null;

            const discountAmount = originalRetailPriceValue !== null
              ? originalRetailPriceValue - newPrice
              : null;

            product.marketingPrice = originalRetailPriceValue !== null
              ? {
                originalPrice: {
                  value: originalRetailPriceValue.toFixed(2),
                  currency: "VND",
                },
                discountPercentage: discountPercentage.toFixed(2),
                discountAmount: {
                  value: discountAmount.toFixed(2),
                  currency: "VND",
                },
                priceTreatment: item.PriceTreatment || "NONE",
              }
              : null;
            product.marketingPrice = newMarketingPriceEntry;
            await this.productRepository.save(product);
          }

          if (product) {
            if (product.quantity !== quantityAvailable) {
              product.quantity = quantityAvailable;
              await this.productRepository.save(product);
            }
          }
        }
      }

      return items.map(item => ({
        name: item.Title || null,
        itemWebUrl: item.ViewItemURLForNaturalSearch || null,
        itemLocation: item.Location || null,
        thumbnailImages: item.PictureURL,
        condition: item.ConditionDisplayName || null,
        condtionOrder: null,
        price: null,
        additionalImages: item.PictureURL || null,
        marketingPrice: null,
        category: categoryEnglishName,
        storeName: storeName,
        brand: null,
        quantity: null,
        localizedAspects: item.ItemSpecifics?.NameValueList || [],
        description: item.ConditionDescription || null,
      }));
    } catch (error) {
      console.error('Error fetching items by ID:', error);
      throw new Error('Failed to fetch items');
    }
  }

  async searchItemById(itemId: string, categoryEnglishName: string): Promise<any> {
    try {
      const accessToken = await this.ebayAuthService.getAccessToken();

      const xmlBody = `
        <?xml version="1.0" encoding="utf-8"?>
        <GetSingleItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <ItemID>${itemId}</ItemID>
            <IncludeSelector>Details,Description,ItemSpecifics,ShippingCosts,TextDescription,Variations</IncludeSelector>
        </GetSingleItemRequest>
        `;

      const response = await axios.post('https://open.api.ebay.com/shopping', xmlBody, {
        headers: {
          'Content-Type': 'application/xml',
          'X-EBAY-API-IAF-TOKEN': accessToken,
          'X-EBAY-API-SITE-ID': '0',
          'X-EBAY-API-CALL-NAME': 'GetSingleItem',
          'X-EBAY-API-VERSION': '863',
          'X-EBAY-API-REQUEST-ENCODING': 'xml'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });

      const item = result.GetSingleItemResponse?.Item;

      if (!item) {
        return;
      }

      const newPriceValue = parseFloat(item?.ConvertedCurrentPrice);
      if (isNaN(newPriceValue)) {
        throw new Error(`Invalid item price for item with ID ${itemId}`);
      }

      const oldRatioPrice = await this.settingService.getRatioPrice();
      const newPrice = newPriceValue * oldRatioPrice + 1300;

      let product = await this.productRepository.findOne({ where: { id: itemId } });

      const originalRetailPriceValue = item.DiscountPriceInfo?.OriginalRetailPrice
        ? parseFloat(item.DiscountPriceInfo.OriginalRetailPrice) * oldRatioPrice
        : null;

      const discountPercentage = originalRetailPriceValue !== null
        ? 100 - ((newPriceValue / item.DiscountPriceInfo?.OriginalRetailPrice) * 100)
        : null;

      const discountAmount = originalRetailPriceValue !== null
        ? originalRetailPriceValue - newPrice
        : null;

      const newMarketingPriceEntry = originalRetailPriceValue !== null
        ? {
          originalPrice: {
            value: originalRetailPriceValue.toFixed(2),
            currency: "VND",
          },
          discountPercentage: discountPercentage.toFixed(2),
          discountAmount: {
            value: discountAmount.toFixed(2),
            currency: "VND",
          },
          priceTreatment: item.PriceTreatment || "NONE",
        }
        : null;

      const quantityAvailable = item.Quantity - item.QuantitySold;
      if (product) {
        if (product.quantity !== quantityAvailable) {
          product.quantity = quantityAvailable;
          await this.productRepository.save(product);
        }
      }

      if (!product) {
        const category = await this.categoryService.findOneByEnglishName(categoryEnglishName);
        if (!category) {
          throw new Error('Category not found');
        }
        product = new ProductEntity();
        product.id = itemId;
        product.name = item.Title;
        product.isUpdated = false;
        product.itemWebUrl = item.ViewItemURLForNaturalSearch;
        product.itemLocation = item.Location || null;
        product.thumbnailImages = item.GalleryURL || item.PictureURL[0];
        product.additionalImages = item.PictureURL;
        product.condition = item.ConditionDisplayName || null;
        product.quantity = quantityAvailable;
        product.category = category;

        const newPriceEntry = {
          lastUpdated: new Date(),
          value: newPrice
        };

        product.price = [newPriceEntry];
        product.marketingPrice = newMarketingPriceEntry;
        await this.productRepository.save(product);
      } else {
        if (product.isUpdated) {
          console.log(`Product with ID ${itemId} has been updated recently. Skipping price update.`);
          return product;
        }

        if (!Array.isArray(product.price)) {
          product.price = [];
        }

        const lastPriceEntry = product.price[product.price.length - 1];
        const lastPrice = lastPriceEntry ? lastPriceEntry.value : null;

        if (!isNaN(newPriceValue)) {
          const oldRatioPrice = await this.settingService.getRatioPrice();
          const newPrice = newPriceValue * oldRatioPrice + 1300;

          if (lastPrice !== newPrice) {
            const priceUpdate = {
              lastUpdated: new Date(),
              value: newPrice
            };
            product.price.push(priceUpdate);
            await this.productRepository.save(product);
            await this.sendPriceNotificationEmail(itemId, product.name, newPrice);
          }
        } else {
          console.error(`Invalid current price or ratio price for product with ID ${itemId}`);
        }

        if (product && product.marketingPrice && product.marketingPrice.originalPrice && product.marketingPrice.originalPrice.value && product.marketingPrice.originalPrice.value !== (item.DiscountPriceInfo?.OriginalRetailPrice * oldRatioPrice).toFixed(2)) {
          const originalRetailPriceValue = item.DiscountPriceInfo?.OriginalRetailPrice
            ? parseFloat(item.DiscountPriceInfo.OriginalRetailPrice) * oldRatioPrice
            : null;

          const discountPercentage = originalRetailPriceValue !== null
            ? 100 - ((newPriceValue / item.DiscountPriceInfo?.OriginalRetailPrice) * 100)
            : null;

          const discountAmount = originalRetailPriceValue !== null
            ? originalRetailPriceValue - newPrice
            : null;

          product.marketingPrice = originalRetailPriceValue !== null
            ? {
              originalPrice: {
                value: originalRetailPriceValue.toFixed(2),
                currency: "VND",
              },
              discountPercentage: discountPercentage.toFixed(2),
              discountAmount: {
                value: discountAmount.toFixed(2),
                currency: "VND",
              },
              priceTreatment: item.PriceTreatment || "NONE",
            }
            : null;
          product.marketingPrice = newMarketingPriceEntry;
          await this.productRepository.save(product);
        }

        if (product) {
          if (product.quantity !== quantityAvailable) {
            product.quantity = quantityAvailable;
            await this.productRepository.save(product);
          }
        }
      }

      return {
        name: item.Title || null,
        itemWebUrl: item.ViewItemURLForNaturalSearch || null,
        itemLocation: item.Location || null,
        thumbnailImages: product.thumbnailImages,
        condition: item.ConditionDisplayName || null,
        condtionOrder: product.conditionOrder,
        price: product.price,
        additionalImages: item.PictureURL || null,
        marketingPrice: product.marketingPrice,
        category: product.category,
        storeName: product.storeName,
        brand: this.getBrandFromLocalizedAspects(item.ItemSpecifics?.NameValueList || null),
        quantity: product.quantity,
        localizedAspects: item.ItemSpecifics?.NameValueList || [],
        description: item.ConditionDescription || null,
      };
    } catch (error) {
      console.error('Error fetching item by ID:', error);
      throw new Error('Failed to fetch item');
    }
  }

  async searchItem(itemId: string): Promise<any> {
    try {
      const accessToken = await this.ebayAuthService.getAccessToken();

      const xmlBody = `
        <?xml version="1.0" encoding="utf-8"?>
        <GetSingleItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <ItemID>${itemId}</ItemID>
            <IncludeSelector>Details,Description,ItemSpecifics,ShippingCosts,TextDescription,Variations</IncludeSelector>
        </GetSingleItemRequest>
        `;

      const response = await axios.post('https://open.api.ebay.com/shopping', xmlBody, {
        headers: {
          'Content-Type': 'application/xml',
          'X-EBAY-API-IAF-TOKEN': accessToken,
          'X-EBAY-API-SITE-ID': '0',
          'X-EBAY-API-CALL-NAME': 'GetSingleItem',
          'X-EBAY-API-VERSION': '863',
          'X-EBAY-API-REQUEST-ENCODING': 'xml'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });

      const item = result.GetSingleItemResponse?.Item;

      const newPriceValue = parseFloat(item?.ConvertedCurrentPrice);

      const oldRatioPrice = await this.settingService.getRatioPrice();
      const newPrice = newPriceValue * oldRatioPrice + 1300;

      const originalRetailPriceValue = item.DiscountPriceInfo?.OriginalRetailPrice
        ? parseFloat(item.DiscountPriceInfo.OriginalRetailPrice) * oldRatioPrice
        : null;

      const discountPercentage = originalRetailPriceValue !== null
        ? 100 - ((newPriceValue / item.DiscountPriceInfo?.OriginalRetailPrice) * 100)
        : null;

      const discountAmount = originalRetailPriceValue !== null
        ? originalRetailPriceValue - newPrice
        : null;

      const newMarketingPriceEntry = originalRetailPriceValue !== null
        ? {
          originalPrice: {
            value: originalRetailPriceValue.toFixed(2),
            currency: "VND",
          },
          discountPercentage: discountPercentage.toFixed(2),
          discountAmount: {
            value: discountAmount.toFixed(2),
            currency: "VND",
          },
          priceTreatment: item.PriceTreatment || "NONE",
        }
        : null;

      return {
        name: item.Title,
        itemWebUrl: item.ViewItemURLForNaturalSearch || null,
        itemLocation: item.Location || null,
        thumbnailImages: item.GalleryURL || item.PictureURL[0],
        condition: item.ConditionDisplayName || null,
        price: newPrice,
        additionalImages: item.PictureURL || null,
        marketingPrice: newMarketingPriceEntry,
        brand: this.getBrandFromLocalizedAspects(item.ItemSpecifics?.NameValueList || null),
        quantity: item.Quantity - item.QuantitySold,
        localizedAspects: item.ItemSpecifics?.NameValueList || [],
        description: item.ConditionDescription || null,
      };
    } catch (error) {
      console.error('Error fetching item by ID:', error);
      throw new Error('Failed to fetch item');
    }
  }

  async getItemById(id: string): Promise<ProductEntity> {
    return await this.productRepository.findOne({ where: { id } });
  }

  private getBrandFromLocalizedAspects(NameValueList: any[]): string | null {
    const brandItem = NameValueList.find((item) => item.Name === 'Brand');
    return brandItem ? brandItem.Value : null;
  }

  async findStoreKeywordsMap(): Promise<Map<string, { keywords: string, category: string }>> {
    const products = await this.productRepository.find();

    const storeKeywordsMap = new Map<string, { keywords: string, category: string }>();

    products.forEach(product => {
      const { storeName, keywords, category } = product;
      if (!storeKeywordsMap.has(storeName)) {
        storeKeywordsMap.set(storeName, { keywords, category: category.englishName });
      }
    });

    return storeKeywordsMap;
  }


  async findProductsByNullStoreName(): Promise<ProductEntity[]> {
    const products = await this.productRepository.find();
    return products.filter(product => product.storeName === null);
  }

  async findProducts(): Promise<ProductEntity[]> {
    const products = await this.productRepository.find();
    return products;
  }

  async updatePricesAccordingToRatio(ratioPrice: number, oldRatioPrice: number | null): Promise<void> {
    const products = await this.productRepository.find();

    await Promise.all(products.map(async product => {
      const initialPrice = product.price[0].value;

      const usedOldRatioPrice = oldRatioPrice !== null ? oldRatioPrice : ratioPrice;

      const newPrice = ((initialPrice - 1300) / usedOldRatioPrice) * ratioPrice + 1300;
      product.price[0].value = newPrice;

      if (product.marketingPrice) {
        const originalPrice = parseFloat(product.marketingPrice.originalPrice.value);
        const discountAmount = parseFloat(product.marketingPrice.discountAmount.value);

        const newOriginalPrice = (originalPrice / usedOldRatioPrice) * ratioPrice;
        const newDiscountAmount = (discountAmount / usedOldRatioPrice) * ratioPrice;

        product.marketingPrice.originalPrice.value = newOriginalPrice.toFixed(2).toString();
        product.marketingPrice.discountAmount.value = newDiscountAmount.toFixed(2).toString();
      } else {
        console.error(`Incomplete or missing marketingPrice data for product with ID ${product.id}`);
      }
      await this.productRepository.save(product);
      // console.log(usedOldRatioPrice);
      // console.log(ratioPrice);
    }));
  }

  async getPriceSubquery(alias: string): Promise<string> {
    return `(SELECT "value" FROM jsonb_array_elements(${alias}.price) AS price ORDER BY (price->>'lastUpdated') DESC LIMIT 1)`;
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedProductsResultDto> {
    let { page, limit, minPrice, maxPrice, category, marketingPrice, condition, conditionOrder, sortField, sortDirection, name, keywords } = paginationQuery;

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


    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder.orderBy("product.quantity", "DESC");

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

      if (category === "Laptop" && keywords) {
        queryBuilder.andWhere('product.name ILIKE :keywords', { keywords: `%${keywords}%` });
      }
    }

    if (marketingPrice) {
      queryBuilder.andWhere("product.marketingPrice IS NOT NULL");
    }

    if (condition) {
      queryBuilder.andWhere("product.condition ILIKE :condition", { condition: `%${condition}%` });
    }

    if (conditionOrder) {
      queryBuilder.andWhere("product.conditionOrder = :conditionOrder", { conditionOrder: conditionOrder });
    }

    if (name) {
      queryBuilder.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }

    if (sortField === 'createAt') {
      const direction = sortDirection === 'descend' ? 'DESC' : 'ASC';
      queryBuilder.orderBy("product.createdAt", direction);
    }

    if (sortField === 'price') {
      const priceAlias = 'price_subquery';
      const priceSubquery = await this.getPriceSubquery('product');
      const direction = sortDirection === 'descend' ? 'DESC' : 'ASC';

      queryBuilder.addSelect(priceSubquery, priceAlias);
      queryBuilder.orderBy(`${priceAlias}`, direction);
    }
    // queryBuilder.addOrderBy("product.quantity = 0", "ASC");

    const [data, totalCount] = await Promise.all([
      queryBuilder
        .leftJoinAndSelect("product.category", "category")
        .skip(offset)
        .take(limit)
        .getMany(),
      queryBuilder.getCount(),
    ]);


    // const translatedData = await Promise.all(data.map(async product => {
    //   const translatedName = await this.translationService.translateText(product.name, 'vi');
    //   // const translatedCondition = await this.translationService.translateText(product.condition, 'vi');
    //   return { ...product, name: translatedName };
    // }));


    return {
      data,
      page,
      limit,
      totalCount,
    };
  }

  async removeProduct(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Remove cart items that reference the product
    await this.cartRepository.createQueryBuilder()
      .delete()
      .from(CartEntity)
      .where("productId = :productId", { productId: id })
      .execute();

    // Remove order items that reference the product
    await this.orderItemRepository.createQueryBuilder()
      .delete()
      .from(OrderItemEntity)
      .where("productId = :productId", { productId: id })
      .execute();

    // Remove the product itself
    await this.productRepository.remove(product);
  }



  async updateProduct(id: string, productData: Partial<ProductEntity>): Promise<ProductEntity> {
    try {
      const existingProduct = await this.productRepository.findOne({ where: { id } });
      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found.`);
      }

      if (productData.price || productData.marketingPrice) {
        productData.isUpdated = true;
      }

      const oldPriceValue = existingProduct.price[existingProduct.price.length - 1].value;

      if (productData.marketingPrice && productData.marketingPrice.discountPercentage) {
        const originalPriceValue = parseFloat(existingProduct.marketingPrice.originalPrice.value);
        const discountPercentage = parseFloat(productData.marketingPrice.discountPercentage);
        const newDiscountAmountValue = (originalPriceValue * discountPercentage) / 100;

        productData.marketingPrice.discountAmount = {
          value: newDiscountAmountValue.toFixed(2),
          currency: "VND",
        };
        const newPriceValue = originalPriceValue - newDiscountAmountValue;
        productData.price = [{
          lastUpdated: new Date(),
          value: newPriceValue,
        }];
      }

      Object.assign(existingProduct, productData);
      const updatedProduct = await this.productRepository.save(existingProduct);
      const newPriceValue = updatedProduct.price[updatedProduct.price.length - 1].value;
      if (newPriceValue !== oldPriceValue) {
        await this.sendPriceNotificationEmail(updatedProduct.id, updatedProduct.name, newPriceValue);
      }
      return updatedProduct;
    } catch (error) {
      throw error;
    }

  }

  async sendPriceNotificationEmail(productId: string, productName: string, newPrice: number) {
    const subject = 'Săn sale cùng Orderus.vn';
    const templatePath = './src/templates/priceUpdate.hbs';

    try {
      const templateContent = await this.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateContent);

      const carts = await this.cartRepository.find({ where: { product: { id: productId } }, relations: ['user'] });

      const ratioPrice = await this.settingService.getRatioPrice()

      for (const cart of carts) {
        if (!isEmail(cart.user.email)) {
          console.log(`Invalid email: ${cart.user.email}. Skipping.`);
          continue;
        }

        const lastPriceIndex = cart.product.price.length - 1;
        const newPrice = cart.product.price[lastPriceIndex].value;
        const newPriceFormatted = newPrice.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });

        const newPriceUSD = (newPrice - 1300) / ratioPrice;
        const newPriceFormattedUSD = newPriceUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        const data = {
          name: cart.user.displayName,
          productId: cart.product.id,
          productName: cart.product.name,
          newPrice: newPriceFormatted,
          newPriceUSD: newPriceFormattedUSD,
          thumbnailImages: cart.product.thumbnailImages || cart.product.additionalImages,
          conditionOrder: cart.product.conditionOrder,
          category: cart.product.category.vietnameseName,
        };
        const emailContent = template(data);
        await this.mailService.sendMail(cart.user.email, subject, emailContent);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
