import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {ModalOptions, ModalSize} from "../../../../util/modal.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrl: './info-modal.component.css'
})
export class InfoModalComponent {
  @ViewChild("infoModal") infoModal: HTMLElement;
  @Output() confirmCancel = new EventEmitter<boolean>();

  constructor(private modalService: NgbModal) {
  }

  open(): void {
    this.modalService.open(this.infoModal, ModalOptions.default(ModalSize.SMALL));
  }

  protected cancel(modal: any): void {
    this.confirmCancel.emit(false);
    modal.dismiss();
  }

  protected ok(modal: any): void {
    this.confirmCancel.emit(true);
    modal.dismiss();
  }
}
