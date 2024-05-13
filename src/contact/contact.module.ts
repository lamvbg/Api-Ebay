import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUs } from './entities';
import { ContactUsController } from './contact.controller';
import { ContactUsService } from './contact.service';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/product/sendmail.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUs]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [ContactUsController],
  providers: [ContactUsService, MailService],
})
export class ContactUsModule {}

