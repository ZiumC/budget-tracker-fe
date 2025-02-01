import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ErrorModel} from "../../../../models/ErrorModel";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions, ModalSize} from "../../../../util/modal.utils";

@Component({
    selector: 'app-error-modal',
    templateUrl: './error-modal.component.html',
    styleUrl: './error-modal.component.css'
})
export class ErrorModalComponent implements OnInit {
    @ViewChild('errorModal') errorModal: any;
    @Input() errorModel: ErrorModel;

    constructor(private modalService: NgbModal) {
    }

    ngOnInit(): void {
        if (!this.errorModal) {
            throw new Error("Error model is required for ErrorModal");
        }
    }

    open(): void {
        this.modalService.open(
            this.errorModal,
            ModalOptions.default(ModalSize.SMALL));
    }
}
