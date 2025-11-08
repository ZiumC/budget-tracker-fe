import {ToastrService} from "ngx-toastr";
import {getErrorResponse} from "./http.util";

export class ToastUtil {
  static handleErrorResponse(toastService: ToastrService, err: any): void {
    const statusCode: number = err.status;
    if (statusCode >= 200 && statusCode <= 299){
      throw new Error("Should be error instead of success");
    }
    const responseModel = getErrorResponse(err);
    let title: string = responseModel.statusCode.toString();
    let message: string = responseModel.error.message;

    toastService.error(message, title);
  }
}
