import { Controller, Get, Post, Body, Put, Delete, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { SettingService } from './setting.service';
import { Setting } from './entities';
import { JAuthGuard } from 'src/auth/utils/authMiddleWare';
import { RolesGuard } from 'src/auth/utils/role.middleware';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { SettingAdminDto, SettingUserDto } from './dto/UserSetting.dto';
import { plainToClass } from 'class-transformer';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) { }

  @Get('admin')
  @UseGuards(JAuthGuard, RolesGuard)
  async findOneAdmin(): Promise<SettingAdminDto> {
    const setting = await this.settingService.findOne();
    return plainToClass(SettingAdminDto, setting);
  }
  
  @Get()
  async findOneUser(): Promise<SettingUserDto> {
    const setting = await this.settingService.findOne();
    return plainToClass(SettingUserDto, setting);
  }

  @Post()
  @UseGuards(JAuthGuard, RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'bannerTopImage', maxCount: 1 },
    { name: 'bannerBotImage', maxCount: 1 },
    { name: 'slideImage', maxCount: 10 },
    { name: 'bankUrl', maxCount: 1 }
  ]))
  async create(
    @Body() settingData: Partial<Setting>,
    @UploadedFiles() files: {
      bannerTopImage?: Multer.File[],
      slideImages?: Multer.File[],
      bannerBotImage?: Multer.File[],
      bankUrl?: Multer.File[],
    },
  ): Promise<Setting> {
    const bannerTopImages = files.bannerTopImage && files.bannerTopImage[0];
    const bannerBotImages = files.bannerBotImage && files.bannerBotImage[0];
    const slideImages = files.slideImages || [];
    const bankUrl = files.bankUrl && files.bankUrl[0]; 
    return this.settingService.create(settingData, bannerTopImages, slideImages, bannerBotImages, bankUrl);
  }

  @Put()
  @UseGuards(JAuthGuard, RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'slideImage', maxCount: 10 },
    { name: 'bannerTopImage', maxCount: 1 },
    { name: 'bannerBotImage', maxCount: 1 },
    { name: 'bankUrl', maxCount: 1 }
  ]))
  async update(
    @Body() updatedSetting: Partial<Setting>,
    @UploadedFiles() files: { bannerTopImage?: Multer.File[], slideImage?: Multer.File[], bannerBotImage?: Multer.File[],bankUrl?: Multer.File[],  }
  ): Promise<Setting> {
    const existingSetting = await this.settingService.findOne();
    const oldRatioPrice = existingSetting ? existingSetting.ratioPrice : null;
    const slideImages = files.slideImage;
    const bannerTopImages = files.bannerTopImage && files.bannerTopImage[0];
    const bannerBotImages = files.bannerBotImage && files.bannerBotImage[0];
    const bankUrl = files.bankUrl && files.bankUrl[0];
    return this.settingService.update(updatedSetting, oldRatioPrice, bannerTopImages, slideImages, bannerBotImages, bankUrl);
  }  
}
