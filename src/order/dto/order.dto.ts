import { DeliveryStatus, PaymentStatus } from "../entities";

export class OrderDto {
    userId: string;
    products: { id:number, productId: string; quantity: number; warrantyFee: number; price: number;
    }[];
    shippingFee: number;
    totalPrice: number;
    address: string;
    createdAt: Date;
    phone: string;
    paymentStatus: PaymentStatus;
    deliveryStatus: DeliveryStatus;
}