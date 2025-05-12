import BigNumber from "bignumber.js";
import {GetAssignmentDto} from "./assignment.model.dto";

export class GetPlannedPaymentDto {
  id: string;
  name: string;
  estimated: BigNumber;
  realPrice: BigNumber;
  isPaid: boolean;
  comment: string;
  dateUpdated: Date;
  assignment: GetAssignmentDto | null;
}

export class PlannedPaymentDto {
  name: string;
  estimated: BigNumber;
  realPrice: BigNumber;
  isPaid: boolean;
  comment: string;
}
