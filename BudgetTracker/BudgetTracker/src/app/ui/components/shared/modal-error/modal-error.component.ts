import {Component, Input, OnInit} from '@angular/core';
import {ErrorModel} from "../../../../models/ErrorModel";

@Component({
  selector: 'app-modal-error',
  templateUrl: './modal-error.component.html',
  styleUrl: './modal-error.component.css'
})
export class ModalErrorComponent implements OnInit {
  @Input() errorModel: ErrorModel;
  protected buttonCopyName: string;

  ngOnInit(): void {
    if (!this.errorModel) {
      this.errorModel = new ErrorModel();
    }
    this.buttonCopyName = "Copy";
  }

  protected copy(inputElement: any): any {
    this.buttonCopyName = "Copied";
    inputElement.select();
    //this is so far deprecated but
    //there is no any best alternatives for now
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    setTimeout((): void => {
      this.buttonCopyName = "Copy";
    }, 2500)
  }
}
