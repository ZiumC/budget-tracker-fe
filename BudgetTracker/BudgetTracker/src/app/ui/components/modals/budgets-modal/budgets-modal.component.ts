import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions, ModalSize} from "../../../../util/modal.utils";
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
  protected readonly budgetsLimit: number = 3;
  protected lastDate: Date;

  constructor(private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.budgetFields = [];
    this.lastDate = new Date();
    this.add();
  }

  ngOnDestroy(): void {
  }

  open(): void {
    this.modalService.open(this.budgetsModal, ModalOptions.default(ModalSize.BIG));
  }

  protected add(): void {
    if (this.budgetFields.length < this.budgetsLimit) {
      this.budgetFields.push(DateUtils.convertToDatePicker(this.lastDate));
      this.lastDate = new Date(this.lastDate.setMonth(this.lastDate.getMonth() + 1));
    }
  }

  protected remove(index: number): void {
    const budgetToRemove = DateUtils.convertToDate(this.budgetFields[index]);
    this.budgetFields = this.budgetFields.filter((_, i) => i !== index);
    if (this.lastDate > budgetToRemove) {
      this.lastDate = new Date(this.lastDate.setMonth(this.lastDate.getMonth() + 1));
    }
    this.lastDate = new Date(this.lastDate.setMonth(this.lastDate.getMonth() - 1));
  }

  protected setLastDate(index: number): void {
    let maxDate: Date = DateUtils.convertToDate(this.budgetFields[index]);
    for (const date of this.budgetFields) {
      const convertedDate = DateUtils.convertToDate(date);
      if (convertedDate > maxDate) {
        maxDate = convertedDate;
      }
    }

    this.lastDate = new Date(maxDate.setMonth(maxDate.getMonth() + 1));
  }

  protected saveBudgets(): void {
    console.log(this.budgetFields);
  }
}
