export class OrderDto {
    userId: string;
    products: { productId: string; quantity: number; warrantyFee: number; price: number;
    }[];
    shippingFee: number;
    warrantyFee: number; 
    totalPrice: number;
    address: string;
    createdAt: Date;
    phone: string;
}