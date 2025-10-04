import {Component, Input} from '@angular/core';
import {ResponseModel} from "../../../../models/response.model";
import {ErrorImage, ErrorType} from "../../../../models/error.model";

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  @Input() response: ResponseModel;
  @Input() notFoundErrorText: string = "Data not found";
  @Input() secondaryErrorText: string;
  @Input() errorType: ErrorType;
  @Input() errorImage: ErrorImage;
  protected readonly ErrorType = ErrorType;
  protected readonly ErrorImage = ErrorImage;
}
