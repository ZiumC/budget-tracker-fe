import BigNumber from "bignumber.js";

export class PaymentDto {
  name: string;
  price: BigNumber;
  refund: BigNumber;
  isPaid: boolean;
  comment?: string;
}

export class PaymentStatusDto {
  isPaid: boolean;
}

export class GetPaymentDto {
  id: string;
  name: string;
  price: BigNumber;
  refund: BigNumber;
  isPaid: boolean;
  comment: string;
  dateUpdated: Date;
}
