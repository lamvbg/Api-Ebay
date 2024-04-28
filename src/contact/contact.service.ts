import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUs } from './entities';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>,
  ) {}

  async createContact(contactData: Partial<ContactUs>): Promise<ContactUs> {
    const newContact = this.contactUsRepository.create(contactData);
    return await this.contactUsRepository.save(newContact);
  }

  async getAllContacts(): Promise<ContactUs[]> {
    return await this.contactUsRepository.find();
  }

  async getContactById(id: number): Promise<ContactUs> {
    return await this.contactUsRepository.findOne({ where: { id } });
  }

  async deleteContact(id: number): Promise<void> {
    await this.contactUsRepository.delete(id);
  }
}
