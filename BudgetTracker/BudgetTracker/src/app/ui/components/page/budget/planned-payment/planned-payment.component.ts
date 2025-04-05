import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-planned-payment',
  templateUrl: './planned-payment.component.html',
  styleUrl: './planned-payment.component.css'
})
export class PlannedPaymentComponent {
  @Input() idBudget: string;
}
