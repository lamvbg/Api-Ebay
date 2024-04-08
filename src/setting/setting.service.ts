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
    bannerTopImages: Multer.File[] = [],
    slideImages: Multer.File[] = [],
    bannerBotImages: Multer.File[] = [],
    bankUrl?: Multer.File
  ): Promise<Setting> {
    const existingSetting = await this.settingRepository.findOne({ where: {} });
  
    // Only delete old images if new images are provided
    if (bannerTopImages.length > 0 || slideImages.length > 0 || bannerBotImages.length > 0 || bankUrl) {
      await this.deleteOldImages(existingSetting);
    }
  
    const mergedSetting = this.settingRepository.merge(existingSetting, updatedSetting);
    const updatedSettingEntity = await this.settingRepository.save(mergedSetting);
  
    if (Number(updatedSettingEntity.ratioPrice) !== Number(oldRatioPrice)) {
      await this.ebayService.updatePricesAccordingToRatio(updatedSettingEntity.ratioPrice, oldRatioPrice);
    }
  
    // Only upload new images if they are provided
    const bannerTopUrls = bannerTopImages.length > 0 ? await this.uploadAndReturnUrl(bannerTopImages) : existingSetting.bannerTop;
    const bannerBotUrls = bannerBotImages.length > 0 ? await this.uploadAndReturnUrl(bannerBotImages) : existingSetting.bannerBot;
    const slideUrls = slideImages.length > 0 ? await Promise.all(slideImages.map(async slideImage => this.uploadAndReturnUrl(slideImage))) : existingSetting.slide.map(slide => slide.slideImg);
    const bankUrls = bankUrl ? await this.uploadAndReturnUrl(bankUrl) : existingSetting.bankUrl;
  
    updatedSettingEntity.bannerTop = bannerTopUrls;
    updatedSettingEntity.bannerBot = bannerBotUrls;
    updatedSettingEntity.slide = slideUrls.map(url => ({ slideImg: url }));
    updatedSettingEntity.bankUrl = bankUrls;
  
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

  async deleteOldImages(setting: Setting): Promise<void> {
    const oldImages: string[] = [];
    if (setting.bannerTop) {
      oldImages.push(setting.bannerTop);
    }

    if (setting.bannerBot) {
      oldImages.push(setting.bannerBot);
    }
    if (setting.slide) {
      setting.slide.forEach(slide => oldImages.push(slide.slideImg));
    }
    if (setting.bankUrl) {
      oldImages.push(setting.bankUrl);
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
