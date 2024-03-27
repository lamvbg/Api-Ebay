import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities';
import { EbayService } from '../product/product.service'; // Import EbayService
import { CloudinaryService } from './utils/file.service';
import { Multer } from 'multer';



@Injectable()
export class SettingService {
  private oldRatioPrice: number | null = null;
  private oldRatioDiscount: number | null = null;
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @Inject(forwardRef(() => EbayService))
    private readonly ebayService: EbayService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  async findOne(): Promise<Setting> {
    return this.settingRepository.findOne({ where: {} });
  }

  async create(settingData: Partial<Setting>, bannerTopImages: Multer.File[], slideImages: Multer.File[], bannerBotImages: Multer.File[]): Promise<Setting> {
    const bannerTopUrls = await Promise.all(bannerTopImages.map(async bannerTopImage => this.uploadAndReturnUrl(bannerTopImage)));
    const bannerBotUrls = await Promise.all(bannerBotImages.map(async bannerBotImage => this.uploadAndReturnUrl(bannerBotImage)));
    const slideUrls = await Promise.all(slideImages.map(async slideImage => this.uploadAndReturnUrl(slideImage)));
  
    const setting: Partial<Setting> = {
      ...settingData,
      bannerTop: bannerTopUrls.map(url => ({ bannerTopImg: url })),
      bannerBot: bannerBotUrls.map(url => ({ bannerBotImg: url })),
      slide: slideUrls.map(url => ({ slideImg: url })),
    };
  
    return this.settingRepository.save(setting);
  }
  

  async update(updatedSetting: Partial<Setting>, oldRatioPrice: number, bannerTopImages: Multer.File[], bannerBotImages: Multer.File[], slideImages: Multer.File[]): Promise<Setting> {
    const existingSetting = await this.settingRepository.findOne({ where: {} });
    const mergedSetting = this.settingRepository.merge(existingSetting, updatedSetting);
    const updatedSettingEntity = await this.settingRepository.save(mergedSetting);
  
    if (Number(updatedSettingEntity.ratioPrice) !== Number(oldRatioPrice)) {
      await this.ebayService.updatePricesAccordingToRatio(updatedSettingEntity.ratioPrice, oldRatioPrice);
    }
  
    const bannerTopUrls = await Promise.all(bannerTopImages.map(async bannerTopImage => this.uploadAndReturnUrl(bannerTopImage)));
    const bannerBotUrls = await Promise.all(bannerBotImages.map(async bannerBotImage => this.uploadAndReturnUrl(bannerBotImage)));
    const slideUrls = await Promise.all(slideImages.map(async slideImage => this.uploadAndReturnUrl(slideImage)));
  
    updatedSettingEntity.bannerTop = bannerTopUrls.map(url => ({ bannerTopImg: url }));
    updatedSettingEntity.bannerBot = bannerBotUrls.map(url => ({ bannerBotImg: url }));
    updatedSettingEntity.slide = slideUrls.map(url => ({ slideImg: url }));
  
    const updatedSettingResult = await this.settingRepository.save(updatedSettingEntity);
    return updatedSettingResult;
  }

  async getRatioPrice(): Promise<number | null> {
    const setting = await this.settingRepository.findOne({ where: {} });
    return setting ? setting.ratioPrice : null;
  }


  async delete(): Promise<void> {
    await this.settingRepository.clear();
  }

  private async uploadAndReturnUrl(file: Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }
}
