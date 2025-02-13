import {Component, Input, ViewChild} from '@angular/core';
import {ResponseErrorModel} from "../../../../models/ResponseErrorModel";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions, ModalSize} from "../../../../util/modal-options.utils";

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.css'
})
export class ErrorModalComponent {
  @ViewChild('errorModal') errorModal: any;
  protected errorModel: ResponseErrorModel;

  constructor(private modalService: NgbModal) {
  }

  open(errorModel: ResponseErrorModel): void {
    this.errorModel = errorModel;
    this.modalService.open(
      this.errorModal,
      ModalOptions.default(ModalSize.SMALL));
  }
}
