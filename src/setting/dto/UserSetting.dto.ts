import { Exclude, Expose } from 'class-transformer';

export class SettingAdminDto {
  @Expose()
  id: number;

  @Expose()
  bannerTop: string;

  @Expose()
  slide: { slideImg: string }[];

  @Expose()
  bannerBot: string;

  @Expose()
  ratioPrice: number;

  @Expose()
  weightBasedPrice: number;

  @Expose()
  warrantyFees: { duration: number; fee: number }[];

  @Expose()
  bankUrl: string;

  @Expose()
  bankInfoName: string;

  @Expose()
  discount: { code: string; value: number };

  @Expose()
  depositAmount: number;
}

export class SettingUserDto {
  @Expose()
  id: number;

  @Expose()
  bannerTop: string;

  @Expose()
  slide: { slideImg: string }[];

  @Expose()
  bannerBot: string;

  @Expose()
  ratioPrice: number;

  @Expose()
  weightBasedPrice: number;

  @Expose()
  warrantyFees: { duration: number; fee: number }[];

  @Expose()
  bankUrl: string;

  @Expose()
  bankInfoName: string;

  @Exclude()
  discount: { code: string; value: number };

  @Expose()
  depositAmount: number;
}
