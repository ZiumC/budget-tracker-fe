import {Component, Input, ViewChild} from '@angular/core';
import {ErrorModel} from "../../../../models/ErrorModel";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions, ModalSize} from "../../../../util/modal.utils";

@Component({
    selector: 'app-error-modal',
    templateUrl: './error-modal.component.html',
    styleUrl: './error-modal.component.css'
})
export class ErrorModalComponent {
    @ViewChild('errorModal') errorModal: any;
    @Input() errorModel: ErrorModel;

    constructor(private modalService: NgbModal) {
    }

    open(errorModel: ErrorModel): void {
        this.errorModel = errorModel;
        this.modalService.open(
            this.errorModal,
            ModalOptions.default(ModalSize.SMALL));
    }
}
