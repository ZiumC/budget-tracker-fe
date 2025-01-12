import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions} from "../../../../util/modal.utils";

@Component({
  selector: 'app-budgets-modal',
  templateUrl: './budgets-modal.component.html',
  styleUrl: './budgets-modal.component.css'
})
export class BudgetsModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetsModal') budgetsModal: any;
  protected budgets: FormGroup;

  constructor(private fb: FormBuilder,
              private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.budgets = this.fb.group({
      fields: this.fb.array([])
    });
  }

  ngOnDestroy(): void {
  }

  open(): void {
    this.modalService.open(this.budgetsModal, ModalOptions.default());
  }

  get fields(): FormArray {
    return this.budgets.get('fields') as FormArray;
  }

  protected add(): void {
    const fieldGroup = this.fb.group({
      fieldName: [''],
    });
    this.fields.push(fieldGroup);
  }

  protected remove(index: number): void {
    this.fields.removeAt(index);
  }

  protected saveBudgets(): void {
    console.log(this.budgets.value);
  }
}
