import {Component, Input, OnInit} from '@angular/core';
import {ResponseModel} from "../../../../models/response.model";

@Component({
  selector: 'app-error-view',
  templateUrl: './error-view.component.html',
  styleUrl: './error-view.component.css'
})
export class ErrorViewComponent implements OnInit {
  @Input() errorModel: ResponseModel;
  protected buttonCopyName: string;

  ngOnInit(): void {
    if (!this.errorModel) {
      this.errorModel = new ResponseModel();
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
