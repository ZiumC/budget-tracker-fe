import {GetIncomeCategoryDto, GetPaymentCategoryDto} from "./category.model.dto";

export class GetPaymentAssignmentDto {
  id: string;
  category: GetPaymentCategoryDto;
  comment: string;
  dateUpdated: Date;
}

export class GetIncomeAssignmentDto {
  id: string;
  category: GetIncomeCategoryDto;
  comment: string;
  dateUpdated: Date;
}
