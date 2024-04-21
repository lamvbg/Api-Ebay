export class UpdateSettingDto {
    bannerTop?: { bannerTopImg: string }[];
    slide?: { slideImg: string }[];
    bannerBot?: { bannerBotImg: string }[];
    ratioPrice?: number;
    ratioDiscount?: number;
    weightBasedPrice?: number;
    bankUrl?: string;
    bankInfoName: string;
    depositAmount: number;
}
