import {Component, OnInit, ViewChild} from '@angular/core';
import {IncomeForm} from "../../../../models/FormModels";
import {IncomeModel} from "../../../../models/RequestModels";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions} from "../../../../util/modal.utils";
import BigNumber from "bignumber.js";

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrl: './income.component.css'
})
export class IncomeComponent implements OnInit {
  @ViewChild('incomeModal') content: any;

  protected incomeFormModel: IncomeForm;
  protected isEditing: boolean = false;

  constructor(private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.setDefaultIncomeForm();
  }

  open(incomeData?: IncomeModel) {
    this.isEditing = incomeData != null;

    if (incomeData) {
      this.incomeFormModel.name = incomeData.name;
      this.incomeFormModel.wage = incomeData.wage;
      this.incomeFormModel.isSurplus = incomeData.isSurplus;
    }

    this.modalService.open(this.content, ModalOptions.default())
      .result.then(
      (result) => {
        if (result == 'Save') {
          console.log(this.incomeFormModel);
          this.setDefaultIncomeForm();
        }
      }
    );
  }

  private setDefaultIncomeForm() {
    this.incomeFormModel = {
      name: "",
      wage: new BigNumber(0.00),
      isSurplus: false
    } as IncomeForm;
  }
}
