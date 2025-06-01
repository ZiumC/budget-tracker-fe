import {Component, ViewChild} from '@angular/core';
import {ModalOptions} from "../../../../util/modal.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {ConfigService} from "../../../../services/config/config.service";

@Component({
  selector: 'app-copy-payment-modal',
  templateUrl: './copy-payment-modal.component.html',
  styleUrl: './copy-payment-modal.component.css'
})
export class CopyPaymentModalComponent {
  @ViewChild('copyPaymentModal') copyModal: any;

  step = 1;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  open() {
    this.modalService.open(this.copyModal, ModalOptions.default());
  }


  protected onSelectData(data: any):void {
    this.goNext();
  }

  protected goNext(): void {
    this.step = this.step + 1;
  }

  protected goBack(): void {
    this.step = this.step - 1;
  }

  private goToStep(stepNumber: number) {
    this.step = stepNumber;
  }
}
