// discount/discount.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountEntity } from './entities';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/product/sendmail.service';
import { UserEntity } from 'src/user/entities';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountEntity, UserEntity]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  providers: [DiscountService, MailService],
  controllers: [DiscountController],
})
export class DiscountModule {}
