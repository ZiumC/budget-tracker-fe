import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {ErrorModel} from "../../../../models/ErrorModel";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {BudgetModel} from "../../../../models/RequestModels";
import {ModalOptions} from "../../../../util/modal.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {BudgetForm} from "../../../../models/FormModels";
import {DateUtils} from "../../../../util/date.utils";

@Component({
  selector: 'app-budget-modal',
  templateUrl: './budget-modal.component.html',
  styleUrl: './budget-modal.component.css'
})
export class BudgetModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetModal') budgetModal: any;
  @Output() refreshIncomeEvent = new EventEmitter<boolean>();
  protected subscriptions: Subscription[];
  protected errorModel: ErrorModel;
  protected budgetForm: BudgetForm;
  protected isEditing: boolean;
  private idBudget: string;

  constructor(
    private modalService: NgbModal) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    this.setDefaultBudgetForm();
    this.errorModel = new ErrorModel();
    this.subscriptions = [];
    this.isEditing = false;
  }

  open(budgetData?: BudgetModel): void {
    this.setDefaultBudgetForm();
    this.isEditing = budgetData != null;

    if (budgetData) {
      this.idBudget = budgetData.id;
      this.budgetForm.name = budgetData.name;
      this.budgetForm.dateStart = DateUtils
        .convertToDatePicker(budgetData.dateStart);
      this.budgetForm.dateEnd = DateUtils
        .convertToDatePicker(budgetData.dateEnd);
    }

    this.modalService.open(this.budgetModal, ModalOptions.default());
  }

  protected checkMonths(inputModel1: any, inputModel2: any): void {
    const dateStart = this.budgetForm.dateStart;
    const dateEnd = this.budgetForm.dateEnd;

    if (dateStart.month != dateEnd.month) {
      inputModel1.control.setErrors({invalidMonth: 'Invalid month'});
      inputModel2.control.setErrors({invalidMonth: 'Invalid month'});
    } else if (dateStart.year != dateEnd.year) {
      inputModel1.control.setErrors({invalidYear: 'Invalid year'});
      inputModel2.control.setErrors({invalidYear: 'Invalid year'});
    } else {
      inputModel1.control.setErrors(null);
      inputModel2.control.setErrors(null);
    }
  }

  private setDefaultBudgetForm(): void {
    const now = new Date();
    const firsDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.budgetForm = {
      name: "",
      dateStart: DateUtils.convertToDatePicker(firsDay),
      dateEnd: DateUtils.convertToDatePicker(lastDay)
    } as BudgetForm;
  }
}
