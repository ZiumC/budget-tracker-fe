import BigNumber from "bignumber.js";
import {GetPaymentAssignmentDto} from "./assignment.model.dto";

export class GetPlannedPaymentDto {
  id: string;
  name: string;
  estimated: BigNumber;
  realPrice: BigNumber;
  isPaid: boolean;
  comment: string;
  dateUpdated: Date;
  assignment: GetPaymentAssignmentDto | null;
}

export class PlannedPaymentDto {
  name: string;
  estimated: BigNumber | null;
  realPrice: BigNumber | null;
  isPaid: boolean;
  comment: string;
  idPaymentCategory: string;
  assignmentComment: string;
}
