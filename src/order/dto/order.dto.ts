export class OrderDto {
    userId: string;
    productId: string;
    quantity: number;
    shippingFee: number;
    warrantyType: string; 
    totalPrice: number;
    address: string;
    createdAt: Date;
}