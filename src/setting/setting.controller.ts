import { Controller, Get, Post, Body, Put, Delete } from '@nestjs/common';
import { SettingService } from './setting.service';
import { Setting } from './entities';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  async findOne(): Promise<Setting> {
    return this.settingService.findOne();
  }

  @Post()
  async create(@Body() setting: Setting): Promise<Setting> {
    return this.settingService.create(setting);
  }

  @Put()
  async update(@Body() updatedSetting: Partial<Setting>): Promise<Setting> {
    const existingSetting = await this.settingService.findOne(); 
    const oldRatioPrice = existingSetting ? existingSetting.ratioPrice : null;

    return this.settingService.update(updatedSetting, oldRatioPrice); // Truyền giá trị cũ của ratioPrice vào phương thức update của SettingService
  }

}
