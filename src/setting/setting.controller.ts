import { Controller, Get, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { Setting } from './entities';
import { JAuthGuard } from 'src/auth/utils/authMiddleWare';
import { RolesGuard } from 'src/auth/utils/role.middleware';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @UseGuards(JAuthGuard, RolesGuard)
  async findOne(): Promise<Setting> {
    return this.settingService.findOne();
  }

  @Post()
  @UseGuards(JAuthGuard, RolesGuard)
  async create(@Body() setting: Setting): Promise<Setting> {
    return this.settingService.create(setting);
  }

  @Put()
  @UseGuards(JAuthGuard, RolesGuard)
  async update(@Body() updatedSetting: Partial<Setting>): Promise<Setting> {
    const existingSetting = await this.settingService.findOne(); 
    const oldRatioPrice = existingSetting ? existingSetting.ratioPrice : null;

    return this.settingService.update(updatedSetting, oldRatioPrice);
  }

}
