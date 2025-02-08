import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {interval, Subscription, takeWhile} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {BudgetModel} from "../../../../models/RequestModels";
import {ModalOptions} from "../../../../util/modal-options.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {BudgetForm, BudgetPickerForm, DatePickerModel} from "../../../../models/FormModels";
import {DateUtils} from "../../../../util/date.utils";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {HttpResponse} from "@angular/common/http";
import {HttpService} from "../../../../services/http/httpService";
import {BudgetStatus} from "../../../../models/modal-models/BudgetStatusModel";
import {ModalUtils} from "../../../../util/modal.utils";
import {AbstractControl, NgForm, NgModel} from "@angular/forms";

@Component({
  selector: 'app-budget-modal',
  templateUrl: './budget-modal.component.html',
  styleUrl: './budget-modal.component.css'
})
export class BudgetModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetModal') budgetModal: any;
  @Output() refreshPageEvent = new EventEmitter<boolean>();
  @Output() updateBudgetEvent = new EventEmitter<string>();
  protected readonly DateUtils = DateUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly maxTime = 25;
  protected readonly ModalUtils = ModalUtils;
  protected subscriptions: Subscription[];
  protected budgetResponse: BudgetStatus;
  protected budgetForm: BudgetPickerForm;
  protected budgetDate: DatePickerModel;
  protected isEditing: boolean;
  protected disableTimer: boolean;
  protected displayTimer: boolean;
  protected timeLeft: number;
  private idBudget: string;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    this.resetBudgetStatus();
    this.setDefaultDatePicker();
    this.subscriptions = [];
    this.timeLeft = this.maxTime;
    this.isEditing = false;
    this.disableTimer = false;
    this.displayTimer = false;
  }

  open(budgetData?: BudgetModel): void {
    this.resetBudgetStatus();
    this.setDefaultDatePicker();

    this.isEditing = budgetData != null;
    this.disableTimer = false;
    this.displayTimer = false;
    this.timeLeft = this.maxTime;

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

  protected validateDates(input1: any, input2: any): void {
    const dateStart = this.budgetForm.dateStart;
    const dateEnd = this.budgetForm.dateEnd;

    if (dateStart.month != dateEnd.month) {
      input1.control.setErrors({invalidMonth: 'Invalid month'});
      input2.control.setErrors({invalidMonth: 'Invalid month'});
    } else if (dateStart.year != dateEnd.year) {
      input1.control.setErrors({invalidYear: 'Invalid year'});
      input2.control.setErrors({invalidYear: 'Invalid year'});
    } else {
      input1.control.setErrors(null);
      input2.control.setErrors(null);
    }
  }

  protected saveBudget(formControls: NgForm): void {
    if (this.isEditing) {
      this.updateBudget();
    } else {
      this.createBudget(formControls);
    }
  }

  protected close(modal: any): void {
    if (!ModalUtils.isUndefinedBudgetStatus(this.budgetResponse) &&
      this.budgetResponse.status) {

      this.disableTimer = true;
      this.refreshPageEvent.emit(true);
    }

    modal.close();
  }

  private updateBudget(): void {
    this.budgetForm.dateStart.day++;
    this.budgetForm.dateEnd.day++;
    const budgetForm = {
      name: this.budgetForm.name,
      dateStart: DateUtils.convertToDate(this.budgetForm.dateStart),
      dateEnd: DateUtils.convertToDate(this.budgetForm.dateEnd)
    } as BudgetForm;

    this.subscriptions.push(
      this.httpService.updateBudget(
        budgetForm,
        this.idBudget).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.updateBudgetEvent.emit(this.idBudget);
        },
        error: (err): void => {
          // this.onRequestFailed(err);
        }
      })
    )
  }

  private createBudget(formControls: NgForm): void {
    const budgetDate = DateUtils
      .format(DateUtils.convertToDate(this.budgetDate));

    this.subscriptions.push(
      this.httpService.createBudget(
        budgetDate
      ).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
        },
        error: (err): void => {
          this.onRequestFailed(err, formControls.controls['budget-date']);
        },
        complete: (): void => {
          this.startTimer();
        }
      })
    )
  }

  private onRequestSuccess(response: HttpResponse<any>): void {
    const status = response.status;
    const isSuccess = status >= 200 && status <= 299;
    this.budgetResponse = {
      status: isSuccess,
      message: status + " - Ok"
    } as BudgetStatus;
  }

  private onRequestFailed(err: any, control: AbstractControl): void {
    control.setErrors({test:  err.error["message"]})
    this.budgetResponse = {
      status: false,
      message: err.status + " - " + err.error["title"]
    } as BudgetStatus;
  }

  private setDefaultDatePicker(): void {
    const now = new Date();
    const firsDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.budgetForm = {
      name: "",
      dateStart: DateUtils.convertToDatePicker(firsDay),
      dateEnd: DateUtils.convertToDatePicker(lastDay)
    } as BudgetPickerForm;

    this.budgetDate = DateUtils.convertToDatePicker(firsDay);
  }

  private resetBudgetStatus(): void {
    this.budgetResponse = new BudgetStatus();
  }

  protected startTimer(): void {
    this.displayTimer = true;
    this.subscriptions
      .push(interval(100)
        .pipe(takeWhile((): boolean => this.timeLeft > 0))
        .subscribe((): void => {
          this.timeLeft--;
          if (this.disableTimer) {
            this.timeLeft = 0;
          }
          if (this.timeLeft == 0) {
            this.modalService.dismissAll();
            this.refreshPageEvent.emit(true);
          }
        }));
  }
}
