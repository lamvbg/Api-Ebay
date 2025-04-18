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

  async create(settingData: Partial<Setting>, bannerTopImages: Multer.File, slideImages: Multer.File[], bannerBotImages: Multer.File,bankUrl?: Multer.File ): Promise<Setting> {
    const bannerTopUrls = await this.uploadAndReturnUrl(bannerTopImages);
    const bannerBotUrls = await this.uploadAndReturnUrl(bannerBotImages);
    const slideUrls = await Promise.all(slideImages.map(async slideImage => this.uploadAndReturnUrl(slideImage)));
    const bankUrls = await this.uploadAndReturnUrl(bankUrl);
    
    const setting: Partial<Setting> = {
      ...settingData,
      bannerTop: bannerTopUrls,
      bannerBot: bannerBotUrls,
      slide: slideUrls.map(url => ({ slideImg: url })),
      bankUrl: bankUrls
    };

    return this.settingRepository.save(setting);
  }

  async update(
    updatedSetting: Partial<Setting>,
    oldRatioPrice: number,
    bannerTopImages: Multer.File,
    slideImages: Multer.File[] = [],
    bannerBotImages: Multer.File,
    bankUrl?: Multer.File
  ): Promise<Setting> {
    const existingSetting = await this.settingRepository.findOne({ where: {} });
  
    // Check if there are any updates in updatedSetting
    const hasUpdates = Object.keys(updatedSetting).some(key => updatedSetting[key] !== undefined);
  
    if (!hasUpdates && !bannerTopImages && slideImages.length === 0 && bannerBotImages && !bankUrl) {
      return existingSetting;
    }
  
    const mergedSetting = this.settingRepository.merge(existingSetting, updatedSetting);
    const updatedSettingEntity = await this.settingRepository.save(mergedSetting);
  
    if (Number(updatedSettingEntity.ratioPrice) !== Number(oldRatioPrice)) {
      await this.ebayService.updatePricesAccordingToRatio(updatedSettingEntity.ratioPrice, oldRatioPrice);
      console.log(updatedSettingEntity.ratioPrice)
      console.log(oldRatioPrice)
    }

    if (bannerTopImages) {
      const bannerTopUrls = await this.uploadAndReturnUrl(bannerTopImages);
      await this.deleteOldImages(existingSetting.bannerTop, undefined, undefined, undefined);
      updatedSettingEntity.bannerTop = bannerTopUrls;
    }    
  
    if (bannerBotImages) {
      const bannerBotUrls = await this.uploadAndReturnUrl(bannerBotImages);
      await this.deleteOldImages(existingSetting.bannerBot, undefined, undefined, undefined);
      updatedSettingEntity.bannerBot = bannerBotUrls;
    }
  
    if (slideImages.length > 0) {
      const slideUrls = await Promise.all(slideImages.map(async slideImage => this.uploadAndReturnUrl(slideImage)));
      await this.deleteOldImages(undefined, undefined, existingSetting.slide, undefined);
      updatedSettingEntity.slide = slideUrls.map(url => ({ slideImg: url }));
    }
    
    if (bankUrl) {
      const bankUrls = await this.uploadAndReturnUrl(bankUrl);
      await this.deleteOldImages(existingSetting.bankUrl, undefined, undefined, undefined);
      updatedSettingEntity.bankUrl = bankUrls;
    }
  
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

  async deleteOldImages(
    bannerTop: string | undefined,
    bannerBot: string | undefined,
    slide: { slideImg: string }[] | undefined,
    bankUrl: string | undefined
  ): Promise<void> {
    const oldImages: string[] = [];
    if (bannerTop) {
      oldImages.push(bannerTop);
    }
  
    if (bannerBot) {
      oldImages.push(bannerBot);
    }
  
    if (slide) {
      slide.forEach(s => oldImages.push(s.slideImg));
    }
  
    if (bankUrl) {
      oldImages.push(bankUrl);
    }
  
    await Promise.all(oldImages.map(async imageUrl => {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(imageUrl);
      await this.cloudinaryService.deleteImage(publicId);
    }));
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
