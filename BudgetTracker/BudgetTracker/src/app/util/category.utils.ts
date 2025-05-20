import {AppConfig} from "../models/config/config";
import {GetAssignmentDto} from "../models/dto/assignment.model.dto";


export function getPaymentType(
  assignmentDto: GetAssignmentDto | null,
  toUpper: boolean,
  appCfg: AppConfig): string {

  const category = assignmentDto?.category;
  let result: string;

  if (category?.isNeeds) {
    result = appCfg.form.categoryModal.needsName;
  } else if (category?.isWants) {
    result = appCfg.form.categoryModal.wantsName;
  } else if (category?.isSavings) {
    result = appCfg.form.categoryModal.savingsName;
  } else {
    result = "NA";
  }

  return toUpper ? result.toUpperCase() : result.toLowerCase();
}
