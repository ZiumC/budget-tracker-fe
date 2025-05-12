import {GetCategoryDto} from "./category.model.dto";

export class GetAssignmentDto {
  id: string;
  category: GetCategoryDto;
  comment: string;
  dateUpdated: Date;
}
