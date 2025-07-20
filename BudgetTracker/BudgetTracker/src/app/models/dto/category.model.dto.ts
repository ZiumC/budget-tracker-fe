export enum CategoryType {
  NEEDS = "needs",
  WANTS = "wants",
  SAVINGS = "savings",
}

class GetCategoryDto {
  id: string;
  name: string;
  description: string;
  dateUpdated: Date;
}

export class GetPaymentCategoryDto extends GetCategoryDto {
  isNeeds: boolean;
  isWants: boolean;
  isSavings: boolean;
}

export class GetIncomeCategoryDto extends GetCategoryDto {

}

export class PaymentCategoryDto {
  name: string;
  description: string;
  isNeeds: boolean;
  isWants: boolean;
  isSavings: boolean;
}
