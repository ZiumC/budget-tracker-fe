import {Component, Input} from '@angular/core';
import {ResponseModel} from "../../../../models/response.model";

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  @Input() response: ResponseModel;
  @Input() notFoundErrorText: string = "Data not found";
}
