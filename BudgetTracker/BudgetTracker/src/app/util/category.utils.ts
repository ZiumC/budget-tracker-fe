import {GetPlannedPaymentDto} from "../models/dto/planned-payment.model.dto";
import {AppConfig} from "../models/config/config";


export function getPaymentType(
  plannedPaymentDto: GetPlannedPaymentDto,
  toUpper: boolean,
  appCfg: AppConfig): string {

  const paymentCategory = plannedPaymentDto.assignment?.category;
  let result: string;

  if (paymentCategory?.isNeeds) {
    result = appCfg.form.categoryModal.needsName;
  } else if (paymentCategory?.isWants) {
    result = appCfg.form.categoryModal.wantsName;
  } else if (paymentCategory?.isSavings) {
    result = appCfg.form.categoryModal.savingsName;
  } else {
    result = "NA";
  }

  return toUpper ? result.toUpperCase() : result.toLowerCase();
}
