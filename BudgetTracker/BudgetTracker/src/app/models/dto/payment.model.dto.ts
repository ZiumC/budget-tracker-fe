import BigNumber from "bignumber.js";
import {GetPaymentAssignmentDto} from "./assignment.model.dto";

export class PaymentDto {
  name: string;
  price: BigNumber | null;
  split: BigNumber | null;
  isPaid: boolean;
  idPaymentCategory: string;
  assignmentComment: string;
}

export class PaymentStatusDto {
  isPaid: boolean;
}

export class GetPaymentDto {
  id: string;
  name: string;
  price: BigNumber;
  split: BigNumber;
  isPaid: boolean;
  dateUpdated: Date;
  assignment: GetPaymentAssignmentDto | null;
}
