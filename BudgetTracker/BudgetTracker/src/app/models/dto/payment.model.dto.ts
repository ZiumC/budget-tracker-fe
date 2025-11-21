import BigNumber from "bignumber.js";
import {GetPaymentAssignmentDto} from "./assignment.model.dto";

export class PaymentDto {
  name: string;
  price: BigNumber | null;
  refund: BigNumber | null;
  isPaid: boolean;
  comment?: string;
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
  refund: BigNumber;
  isPaid: boolean;
  comment: string;
  dateUpdated: Date;
  assignment: GetPaymentAssignmentDto | null;
}
