import {GetIncomeAssignmentDto} from "./assignment.model.dto";

export class IncomeDto {
  name: string;
  wage: BigNumber | null;
  savings: BigNumber | null;
  isSurplus: boolean;
  forSavings: boolean;
  idIncomeCategory: string;
  assignmentComment: string;
}

export class GetIncomeDto {
  id: string;
  name: string;
  wage: BigNumber;
  savings: BigNumber;
  isSurplus: boolean;
  forSavings: boolean;
  dateUpdated: Date;
  assignment: GetIncomeAssignmentDto | null;
}
