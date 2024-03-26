export class OrderDto {
    userId: number;
    productId: string;
    quantity: number;
    shippingFee: number;
    warrantyFee: number;
    totalPrice: number;
    createdAt: Date;
}