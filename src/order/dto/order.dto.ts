export class OrderDto {
    userId: number;
    productId: string;
    quantity: number;
    shippingFee: number;
    warrantyType: string; 
    totalPrice: number;
    createdAt: Date;
}