import BigNumber from "bignumber.js";

export class IncomeDto {
  name: string;
  wage: BigNumber;
  isSurplus: boolean;
}

export class GetIncomeDto {
  id: string;
  name: string;
  wage: BigNumber;
  isSurplus: boolean;
  dateUpdated: Date;
}
