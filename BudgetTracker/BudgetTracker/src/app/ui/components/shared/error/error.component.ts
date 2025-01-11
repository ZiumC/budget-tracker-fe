import {Component, Input} from '@angular/core';
import {ErrorModel} from "../../../../models/ErrorModel";

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  @Input() errorModel: ErrorModel;
  @Input() notFoundErrorText: string = "Data not found";
}
