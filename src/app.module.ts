import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EbayModule } from './product/product.module';
import { DatabaseModule } from './config/database.module';
import { OrderModule } from './order/order.module';
import { CategoryModule } from './Category/category.module';
import { SettingModule } from './setting/setting.module';
import { CartModule } from './cart/cart.module';
import { DiscountModule } from './discount/discount.module';

@Module({
  imports: [
    AuthModule,
    // UserModule,
    EbayModule,
    DatabaseModule,
    OrderModule,
    CategoryModule,
    SettingModule,
    CartModule,
    DiscountModule
  ],
})
export class AppModule {}
