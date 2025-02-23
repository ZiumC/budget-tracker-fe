import {Component, Input, ViewChild} from '@angular/core';
import {ResponseModel} from "../../../../models/response.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions, ModalSize} from "../../../../util/modal.utils";

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.css'
})
export class ErrorModalComponent {
  @ViewChild('errorModal') errorModal: any;
  protected errorModel: ResponseModel;

  constructor(private modalService: NgbModal) {
  }

  open(errorModel: ResponseModel): void {
    this.errorModel = errorModel;
    this.modalService.open(
      this.errorModal,
      ModalOptions.default(ModalSize.SMALL));
  }
}
