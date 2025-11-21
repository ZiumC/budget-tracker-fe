export enum CategoryType {
  NEEDS = "needs",
  WANTS = "wants",
  INCOMES = "incomes"
}

export class GetCategoryDto {
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

class CategoryDto {
  name: string;
  description: string;
}

export class IncomeCategoryDto extends CategoryDto {

}

export class PaymentCategoryDto extends CategoryDto {
  isNeeds: boolean;
  isWants: boolean;
  isSavings: boolean;
}
