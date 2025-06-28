import {GetPlannedPaymentDto} from "../dto/planned-payment.model.dto";
import {Status} from "../response.model";


export class PlannedPaymentStatus {
  getPlannedPaymentDto: GetPlannedPaymentDto;
  status: Status;
}
