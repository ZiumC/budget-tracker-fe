import BigNumber from "bignumber.js";
import {GetPaymentAssignmentDto} from "./assignment.model.dto";

export class GetPlannedPaymentDto {
  id: string;
  name: string;
  estimated: BigNumber | null;
  actual: BigNumber | null;
  isPaid: boolean;
  dateUpdated: Date;
  assignment: GetPaymentAssignmentDto | null;
}

export class PlannedPaymentDto {
  name: string;
  estimated: BigNumber | null;
  actual: BigNumber | null;
  isPaid: boolean;
  idPaymentCategory: string;
  assignmentComment: string;
}
