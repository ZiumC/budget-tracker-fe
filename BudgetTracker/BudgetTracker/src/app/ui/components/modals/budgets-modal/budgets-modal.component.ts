import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions} from "../../../../util/modal.utils";
import {DatePickerModel} from "../../../../models/FormModels";
import {DateUtils} from "../../../../util/date.utils";

@Component({
  selector: 'app-budgets-modal',
  templateUrl: './budgets-modal.component.html',
  styleUrl: './budgets-modal.component.css'
})
export class BudgetsModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetsModal') budgetsModal: any;
  protected budgetFields: DatePickerModel[];

  constructor(private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.budgetFields = [];
    this.add();
  }

  ngOnDestroy(): void {
  }

  open(): void {
    this.modalService.open(this.budgetsModal, ModalOptions.default());
  }

  protected add(): void {
    this.budgetFields.push(DateUtils.convertToDatePicker(new Date()))
  }

  protected remove(index: number): void {
    this.budgetFields = this.budgetFields.filter((_, i) => i !== index);
  }

  protected saveBudgets(): void {
    console.log(this.budgetFields);
  }
}
