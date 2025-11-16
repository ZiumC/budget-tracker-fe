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

  static successfullyInitRegister(toastService: ToastrService, email: string): void {
    toastService.success(`Verification code has been send to email ${email}`, "Account has been registered!");
  }

  static successfullyCompletedRegister(toastService: ToastrService): void {
    toastService.success("Email has been confirmed!");
  }

  static successfullyInitResetPass(toastService: ToastrService, email: string): void {
    toastService.success(`Temporary password has been sent to email ${email}`, "Requested for password change!");
  }

  static successfullyCompleteResetPass(toastService: ToastrService): void {
    toastService.success("Password has been changed!");
  }

  static successfullyInitEmailChange(toastService: ToastrService, email: string): void {
    toastService.success(`Code has been sent to email ${email}`, "Requested for email change!");
  }

  static successfullyCompleteEmailChange(toastService: ToastrService): void {
    toastService.success("Email has been changed!");
  }

  static successfullyEnabled2FA(toastService: ToastrService, email: string): void {
    toastService.success(`Successfully enabled 2FA for user ${email}!`);
  }

  static successfullyDisabled2FA(toastService: ToastrService, email: string): void {
    toastService.success(`Successfully disabled 2FA for user ${email}!`);
  }

  static successfullyChangedPassword(toastService: ToastrService): void {
    toastService.success("Password has been changed!");
  }
}
