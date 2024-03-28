import { Controller, Get, Post, Body, Put, Delete, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { SettingService } from './setting.service';
import { Setting } from './entities';
import { JAuthGuard } from 'src/auth/utils/authMiddleWare';
import { RolesGuard } from 'src/auth/utils/role.middleware';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) { }

  @Get()
  async findOne(): Promise<Setting> {
    return this.settingService.findOne();
  }

  @Post()
  @UseGuards(JAuthGuard, RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'bannerTopImage', maxCount: 10 },
    { name: 'bannerBotImage', maxCount: 10 },
    { name: 'slideImage', maxCount: 10 },
  ]))
  async create(@Body() setting: Partial<Setting>,
    @UploadedFiles() files: { bannerTopImage?: Multer.File[], slideImage?: Multer.File[], bannerBotImage?: Multer.File[] }
  ): Promise<Setting> {
    const bannerTopImages = files.bannerTopImage;
    const bannerBotImages = files.bannerBotImage;
    const slideImages = files.slideImage;
    return this.settingService.create(setting, bannerTopImages, slideImages, bannerBotImages);
  }

  @Put()
  @UseGuards(JAuthGuard, RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'bannerTopImage', maxCount: 10 },
    { name: 'bannerBotImage', maxCount: 10 },
    { name: 'slideImage', maxCount: 10 },
  ]))
  async update(
    @Body() updatedSetting: Partial<Setting>,
    @UploadedFiles() files: { bannerTopImage?: Multer.File[], slideImage?: Multer.File[], bannerBotImage?: Multer.File[] }
  ): Promise<Setting> {
    const existingSetting = await this.settingService.findOne();
    const oldRatioPrice = existingSetting ? existingSetting.ratioPrice : null;
    const bannerTopImages = files.bannerTopImage;
    const bannerBotImages = files.bannerBotImage;
    const slideImages = files.slideImage;
    return this.settingService.update(updatedSetting, oldRatioPrice, bannerTopImages, slideImages, bannerBotImages);
  }
}
