import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUs } from './entities';
import { MailService } from '../product/sendmail.service';

@Injectable()
export class ContactUsService {
  constructor(
    private mailService: MailService,
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>,
  ) {}

  async createContact(contactData: Partial<ContactUs>): Promise<ContactUs> {
    const newContact = this.contactUsRepository.create(contactData);
    console.log(newContact.email);

    try {
      await this.contactUsRepository.save(newContact);
      const from = newContact.email;

      const to = 'lamvbgcd191320@fpt.edu.vn'; 
      const subject = 'Có liên hệ mới';
      const html = `Bạn đã nhận được một liên hệ mới từ ${newContact.email}.<br><br><strong>Nội dung:</strong><br>${newContact.comment}`;
      await this.mailService.sendContact(from, to, subject, html);
    } catch (error) {
      console.error('Error creating contact:', error);
    }

    return newContact;
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
