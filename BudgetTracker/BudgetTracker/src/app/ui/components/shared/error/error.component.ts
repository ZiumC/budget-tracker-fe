import {Component, Input} from '@angular/core';
import {ResponseErrorModel} from "../../../../models/ResponseErrorModel";

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  @Input() errorModel: ResponseErrorModel;
  @Input() notFoundErrorText: string = "Data not found";
}
