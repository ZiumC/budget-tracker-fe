import {ToastrService} from "ngx-toastr";
import {getErrorResponse} from "./http.util";

export class ToastUtil {
  static handleErrorResponse(toastService: ToastrService, err: any): void {
    const statusCode: number = err.status;
    if (statusCode >= 200 && statusCode <= 299) {
      throw new Error("Should be error instead of success");
    }
    const responseModel = getErrorResponse(err);
    let title: string = responseModel.statusCode.toString();
    let message: string = responseModel.error.message;

    toastService.error(message, title);
  }

  static accountRegistered(toastService: ToastrService, email: string): void {
    toastService.success(`Verification code has been send to email ${email}`, "Account has been registered!");
  }

  static passwordResetRequested(toastService: ToastrService, email: string): void {
    toastService.success(`Temporary password has been sent to email ${email}`, "Requested for password change!");
  }

  static emailConfirmed(toastService: ToastrService): void {
    toastService.success("Email has been confirmed!");
  }

  static passwordSuccessfullySet(toastService: ToastrService): void {
    toastService.success("Password has been changed!");
  }

  static enabled2FaSuccessfully(toastService: ToastrService, email: string): void {
    toastService.success(`Successfully enabled 2FA for user ${email}!`);
  }
}
