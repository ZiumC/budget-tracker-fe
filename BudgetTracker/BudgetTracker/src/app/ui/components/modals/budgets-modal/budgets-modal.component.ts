import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from "@angular/forms";
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
  protected budgetsGroup: FormGroup;
  protected budgetFields: DatePickerModel[];

  constructor(private fb: FormBuilder,
              private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.budgetFields = [];
    // this.budgetsGroup = this.fb.group({
    //   fields: this.fb.array([])
    // });
    this.add();
  }

  ngOnDestroy(): void {
  }

  open(): void {
    this.modalService.open(this.budgetsModal, ModalOptions.default());
  }

  // get fields(): FormArray {
  //   return this.budgetsGroup.get('fields') as FormArray;
  // }

  protected add(): void {
    // const fieldGroup = this.fb.group({
    //   fieldName: [''],
    // });
    // this.fields.push(fieldGroup);
    this.budgetFields.push(DateUtils.convertToDatePicker(new Date()))
  }

  protected remove(index: number): void {
    // this.fields.removeAt(index);
    this.budgetFields.slice(index, 1);
  }

  protected saveBudgets(): void {
    console.log(this.budgetFields);
  }
}
