import {Component, Input, OnInit} from '@angular/core';
import {ResponseErrorModel} from "../../../../models/ResponseErrorModel";

@Component({
  selector: 'app-error-view',
  templateUrl: './error-view.component.html',
  styleUrl: './error-view.component.css'
})
export class ErrorViewComponent implements OnInit {
  @Input() errorModel: ResponseErrorModel;
  protected buttonCopyName: string;

  ngOnInit(): void {
    if (!this.errorModel) {
      this.errorModel = new ResponseErrorModel();
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
