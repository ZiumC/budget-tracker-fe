import {GetPlannedPaymentDto, PlannedPaymentDto} from "../models/dto/planned-payment.model.dto";

export function toPlannedPaymentDto(value: GetPlannedPaymentDto): PlannedPaymentDto {
  const assignmentId = value.assignment?.category.id;
  const assignmentComment = value.assignment?.comment;

  return {
    name: value.name,
    estimated: value.estimated,
    actual: value.actual,
    isPaid: value.isPaid,
    idPaymentCategory: assignmentId ? assignmentId : '',
    assignmentComment: assignmentComment ? assignmentComment : ''
  };
}
