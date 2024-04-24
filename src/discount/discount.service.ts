// discount/discount.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountEntity } from './entities';
import { MailService } from '../product/sendmail.service';
import * as fs from 'fs';
import { promisify } from 'util';
import * as handlebars from 'handlebars';
import { UserEntity } from '../user/entities';

@Injectable()
export class DiscountService {
  private readFile = promisify(fs.readFile);

  constructor(
    @InjectRepository(DiscountEntity)
    private readonly discountRepository: Repository<DiscountEntity>,
    private readonly mailService: MailService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<DiscountEntity[]> {
    return this.discountRepository.find();
  }

  async findOne(id: number): Promise<DiscountEntity> {
    return this.discountRepository.findOne({where: {id}});
  }

  async create(discount: Partial<DiscountEntity>): Promise<DiscountEntity> {
    const newDiscount = await this.discountRepository.save(discount);

    // await this.sendDiscountEmail(newDiscount);

    return newDiscount;
  }

  async update(id: number, discount: Partial<DiscountEntity>): Promise<DiscountEntity> {
    await this.discountRepository.update(id, discount);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.discountRepository.delete(id);
  }

  // async sendDiscountEmail(discount: DiscountEntity) {
  //   const subject = 'Bạn vừa nhận được một mã giảm giá mới!';
  //   const templatePath = './src/templates/discountCode.hbs';

  //   try {
  //     const templateContent = await this.readFile(templatePath, 'utf8');

  //     const template = handlebars.compile(templateContent);

  //     const users = await this.userRepository.find();

  //     for (const user of users) {
  //       const data = {
  //         name: user.displayName,
  //         discountCode: discount.code,
  //         discountValue: discount.value
  //       };

  //       const processedTemplate = template(data);

  //       await this.mailService.sendMail(user.email, subject, processedTemplate);
  //       console.log(`Email sent successfully to ${user.email}`);
  //     }
  //   } catch (error) {
  //     console.error('Error sending email:', error);
  //   }
  // }
}
