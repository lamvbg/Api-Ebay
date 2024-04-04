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

  async create(settingData: Partial<Setting>, bannerTopImages: Multer.File[], slideImages: Multer.File[], bannerBotImages: Multer.File[],bankUrl?: Multer.File ): Promise<Setting> {
    const bannerTopUrls = await Promise.all(bannerTopImages.map(async bannerTopImage => this.uploadAndReturnUrl(bannerTopImage)));
    const bannerBotUrls = await Promise.all(bannerBotImages.map(async bannerBotImage => this.uploadAndReturnUrl(bannerBotImage)));
    const slideUrls = await Promise.all(slideImages.map(async slideImage => this.uploadAndReturnUrl(slideImage)));
    const bankUrls = await this.uploadAndReturnUrl(bankUrl);
    
    const setting: Partial<Setting> = {
      ...settingData,
      bannerTop: bannerTopUrls.map(url => ({ bannerTopImg: url })),
      bannerBot: bannerBotUrls.map(url => ({ bannerBotImg: url })),
      slide: slideUrls.map(url => ({ slideImg: url })),
      bankUrl: bankUrls
    };

    return this.settingRepository.save(setting);
  }

  async update(
    updatedSetting: Partial<Setting>,
    oldRatioPrice: number,
    oldWarrantyFees: { [key: string]: number },
    bannerTopImages: Multer.File[],
    bannerBotImages: Multer.File[],
    slideImages: Multer.File[],
    bankUrl?: Multer.File
  ): Promise<Setting> {
    const existingSetting = await this.settingRepository.findOne({ where: {} });
    await this.deleteOldImages(existingSetting);
    const mergedSetting = this.settingRepository.merge(existingSetting, updatedSetting);
    const updatedSettingEntity = await this.settingRepository.save(mergedSetting);
  
    if (JSON.stringify(updatedSettingEntity.warrantyFees) != JSON.stringify(oldWarrantyFees)) {
      await this.ebayService.updateWarrantyFees(updatedSettingEntity.warrantyFees, oldWarrantyFees);
    }
  
    if (Number(updatedSettingEntity.ratioPrice) !== Number(oldRatioPrice)) {
      await this.ebayService.updatePricesAccordingToRatio(updatedSettingEntity.ratioPrice, oldRatioPrice);
    }
  
    const bannerTopUrls = await Promise.all(bannerTopImages.map(async bannerTopImage => this.uploadAndReturnUrl(bannerTopImage)));
    const bannerBotUrls = await Promise.all(bannerBotImages.map(async bannerBotImage => this.uploadAndReturnUrl(bannerBotImage)));
    const slideUrls = await Promise.all(slideImages.map(async slideImage => this.uploadAndReturnUrl(slideImage)));
    const bankUrls = await this.uploadAndReturnUrl(bankUrl);
  
    updatedSettingEntity.bannerTop = bannerTopUrls.map(url => ({ bannerTopImg: url }));
    updatedSettingEntity.bannerBot = bannerBotUrls.map(url => ({ bannerBotImg: url }));
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
    setting.bannerTop.forEach(banner => oldImages.push(banner.bannerTopImg));
    setting.bannerBot.forEach(banner => oldImages.push(banner.bannerBotImg));
    setting.slide.forEach(slide => oldImages.push(slide.slideImg));
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

  async getWarrantyFee(warrantyType: string, id: number): Promise<number | null> {
    const setting = await this.settingRepository.findOne({where: {id}});
    if (!setting) {
      return null;
    }
    const warrantyFee = setting.warrantyFees[warrantyType];
    return warrantyFee !== undefined ? warrantyFee : null;
  }
}
