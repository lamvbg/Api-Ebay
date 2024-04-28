import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUs } from './entities';
import { ContactUsController } from './contact.controller';
import { ContactUsService } from './contact.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUs]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}

