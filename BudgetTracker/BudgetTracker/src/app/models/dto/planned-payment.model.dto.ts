import BigNumber from "bignumber.js";

export class GetPlannedPaymentDto {
  id: string;
  name: string;
  estimated: BigNumber;
  realPrice: BigNumber;
  isPaid: boolean;
  comment: string;
  dateUpdated: Date;
}

export class PlannedPaymentDto {
  name: string;
  estimated: BigNumber;
  realPrice: BigNumber;
  isPaid: boolean;
  comment: string;
}
