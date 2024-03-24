import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities';
import { EbayService } from '../product/product.service'; // Import EbayService

@Injectable()
export class SettingService {
  private oldRatioPrice: number | null = null;
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @Inject(forwardRef(() => EbayService))
    private readonly ebayService: EbayService,
  ) { }

  async findOne(): Promise<Setting> {
    return this.settingRepository.findOne({ where: {} });
  }

  async create(setting: Setting): Promise<Setting> {
    return this.settingRepository.save(setting);
  }

  async update(updatedSetting: Partial<Setting>, oldRatioPrice: number): Promise<Setting> {
    // Cập nhật setting với các giá trị mới
    const existingSetting = await this.settingRepository.findOne({ where: {} });
    const mergedSetting = this.settingRepository.merge(existingSetting, updatedSetting);
    const updatedSettingEntity = await this.settingRepository.save(mergedSetting);

    // Gọi hàm updatePricesAccordingToRatio với giá trị cũ và mới của ratioPrice
    await this.ebayService.updatePricesAccordingToRatio(updatedSettingEntity.ratioPrice, oldRatioPrice);

    return updatedSettingEntity;
}

  async getRatioPrice(): Promise<number | null> {
    const setting = await this.settingRepository.findOne({ where: {} });
    return setting ? setting.ratioPrice : null;
  }


  async delete(): Promise<void> {
    await this.settingRepository.clear();
  }
}
