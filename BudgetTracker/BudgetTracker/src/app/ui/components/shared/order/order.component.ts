import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  @Input() orderTypes: ORDER_TYPES[];
  protected selectedOrderType: ORDER_TYPES;
  protected displayOrderOption: boolean;
  private excludedTypes: ORDER_TYPES[];

  ngOnInit(): void {
    if (!this.orderTypes) {
      throw new Error('Order options are empty');
    }

    this.excludedTypes = [
      ORDER_TYPES.PAID_FIRST,
      ORDER_TYPES.SURPLUS_FIRST
    ];

    this.selectedOrderType = this.orderTypes[0];
    this.displayOrderOption = true;
  }

  protected onOrderTypeChanged(): void {
    this.displayOrderOption = !this.excludedTypes.includes(this.selectedOrderType);
  }
}

export enum ORDER_TYPES {
  DATE_UPDATED = 'date updated',
  MONEY = 'money',
  PAID_FIRST = 'paid first',
  SURPLUS_FIRST = 'surplus first',
  REAL_COST = 'real cost'
}
