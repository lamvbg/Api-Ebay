// src/contact/contactus.controller.ts

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ContactUs } from './entities';
import { ContactUsService } from './contact.service';
import { RolesGuard } from 'src/auth/utils/role.middleware';
import { JAuthGuard } from 'src/auth/utils/authMiddleWare';

@Controller('contactus')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Get()
  async findAll(): Promise<ContactUs[]> {
    return this.contactUsService.getAllContacts();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ContactUs> {
    return this.contactUsService.getContactById(id);
  }

  @Post()
  async create(@Body() contactData: Partial<ContactUs>): Promise<ContactUs> {
    return this.contactUsService.createContact(contactData);
  }

  @Delete(':id')
  @UseGuards(JAuthGuard, RolesGuard)
  async remove(@Param('id') id: number): Promise<{ message: string }> {
      await this.contactUsService.deleteContact(id);
      return { message: `Contact Us with ID ${id} deleted successfully` };
  }
}

