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
  protected readonly DateUtils = DateUtils;
  protected subscriptions: Subscription[];
  protected errorModel: ErrorModel;
  protected budgetForm: BudgetForm;
  protected isEditing: boolean;
  protected dateStartModel: any;
  protected dateEndModel: any;
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
      this.budgetForm.dateStart = budgetData.dateStart;
      this.budgetForm.dateEnd = budgetData.dateEnd;

      const lastDayFormatted = DateUtils.format(budgetData.dateEnd)
      this.dateEndModel = {
        "year": +lastDayFormatted.split("/")[2],
        "month": +lastDayFormatted.split("/")[1],
        "day": +lastDayFormatted.split("/")[0]
      }

    }

    this.modalService.open(this.budgetModal, ModalOptions.default());
  }

  private setDefaultBudgetForm(): void {
    const now = new Date();
    const firsDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const firstDayFormatted = DateUtils.format(firsDay);
    const lastDayFormatted = DateUtils.format(lastDay);

    this.budgetForm = {
      name: "",
      dateStart: firsDay,
      dateEnd: lastDay
    } as BudgetForm;

    this.dateStartModel = {
      "year": firsDay.getFullYear(),
      "month": +firstDayFormatted.split("/")[1],
      "day": +firstDayFormatted.split("/")[0]
    }

    this.dateEndModel = {
      "year": lastDay.getFullYear(),
      "month": +lastDayFormatted.split("/")[1],
      "day": +lastDayFormatted.split("/")[0]
    }
  }
}
