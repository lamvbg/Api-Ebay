export class OrderDto {
    userId: string;
    products: { id:number, productId: string; quantity: number; warrantyFee: number; price: number;
    }[];
    shippingFee: number;
    warrantyFee: number; 
    totalPrice: number;
    address: string;
    createdAt: Date;
    phone: string;
}