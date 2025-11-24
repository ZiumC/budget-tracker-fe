import {AppConfig} from "../models/config/config";
import {GetPaymentAssignmentDto} from "../models/dto/assignment.model.dto";


export function getPaymentType(
  assignmentDto: GetPaymentAssignmentDto | null,
  toUpper: boolean,
  appCfg: AppConfig): string {

  const category = assignmentDto?.category;
  let result: string;

  if (category?.isNeeds) {
    result = appCfg.form.categoryModal.needsName;
  } else if (category?.isWants) {
    result = appCfg.form.categoryModal.wantsName;
  } else {
    result = "NA";
  }

  return toUpper ? result.toUpperCase() : result.toLowerCase();
}
