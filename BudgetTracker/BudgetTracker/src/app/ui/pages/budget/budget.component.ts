import {Component, OnInit} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit {
  protected readonly SpinnerSize = SpinnerSize;
  protected isLoaded: boolean = false;
  protected selectedIncome: boolean = false;

  ngOnInit(): void {
    this.isLoaded = true;
  }
}
