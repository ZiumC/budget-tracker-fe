import {GetPaymentCategoryDto} from "./category.model.dto";

export class GetAssignmentDto {
  id: string;
  category: GetPaymentCategoryDto;
  comment: string;
  dateUpdated: Date;
}
