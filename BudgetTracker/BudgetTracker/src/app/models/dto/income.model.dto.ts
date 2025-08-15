import {GetIncomeAssignmentDto} from "./assignment.model.dto";

export class IncomeDto {
  name: string;
  wage: BigNumber;
  savings: BigNumber;
  isSurplus: boolean;
  idIncomeCategory: string;
  assignmentComment: string;
}

export class GetIncomeDto {
  id: string;
  name: string;
  wage: BigNumber;
  savings: BigNumber;
  isSurplus: boolean;
  dateUpdated: Date;
  assignment: GetIncomeAssignmentDto | null;
}
