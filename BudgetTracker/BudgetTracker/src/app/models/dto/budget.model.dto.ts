export class BudgetDto {
  name: string;
  dateStart: Date;
  dateEnd: Date;
}

export class GetBudgetDto {
  id: string;
  name: string;
  dateEnd: Date;
  dateStart: Date;
}
