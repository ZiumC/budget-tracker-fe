export enum CategoryType {
  NEEDS = "needs",
  WANTS = "wants",
  SAVINGS = "savings"
}

export class GetCategoryDto {
  id: string;
  name: string;
  description: string;
  isNeeds: boolean;
  isWants: boolean;
  isSavings: boolean;
  dateUpdated: Date;
}
