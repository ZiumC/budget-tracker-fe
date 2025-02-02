import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  @Input() orderTypes: ORDER_TYPES[];
  @Input() name: string;
  protected orderOptions: ORDER_OPTIONS[];
  protected selectedOrderType: ORDER_TYPES;
  protected selectedOrderOption: ORDER_OPTIONS;
  protected displayOrderOption: boolean;
  protected excludedTypes: ORDER_TYPES[];

  private orderTypeName: string;
  private orderOptionName: string;

  ngOnInit(): void {
    if (!this.orderTypes) {
      throw new Error('Order options are empty');
    }

    if (!this.name) {
      throw new Error('Name is required');
    }

    this.orderTypeName = this.name + "-type";
    this.orderOptionName = this.name + "-option";

    this.excludedTypes = [
      ORDER_TYPES.PAID_FIRST,
      ORDER_TYPES.SURPLUS_FIRST
    ];

    this.orderOptions = [
      ORDER_OPTIONS.ASCENDING,
      ORDER_OPTIONS.DESCENDING,
    ]

    const orderType = this.getFromLocalStorage(this.orderTypeName);
    const orderOption = this.getFromLocalStorage(this.orderOptionName);

    this.selectedOrderType = this.orderTypes[this.orderTypesIndex(orderType)];
    this.selectedOrderOption = this.orderOptions[this.orderOptionsIndex(orderOption)];
    this.displayOrderOption = true;
  }

  protected onOrderTypeChanged(): void {
    this.saveToLocalStorage(this.orderTypeName, this.selectedOrderType);
  }

  protected onOrderOptionChanged(): void {
    this.saveToLocalStorage(this.orderOptionName, this.selectedOrderOption);
  }

  private getFromLocalStorage(name: string): string | null {
    return localStorage.getItem(name);
  }

  private saveToLocalStorage(name: string, value: any): void {
    localStorage.setItem(name, value);
  }

  private orderTypesIndex(value: string | null): number {
    const foundIndex = this.orderTypes.findIndex(x => x === value);
    return foundIndex > -1 ? foundIndex : 0;
  }

  private orderOptionsIndex(value: string | null): number {
    const foundIndex = this.orderOptions.findIndex(x => x === value);
    return foundIndex > -1 ? foundIndex : 0;
  }
}

export enum ORDER_TYPES {
  DATE_UPDATED = 'date updated',
  PRICE = 'price',
  REFUND = 'refund',
  WAGE = 'wage',
  REAL_COST = 'real cost',
  PAID_FIRST = 'paid first',
  SURPLUS_FIRST = 'surplus first'
}

export enum ORDER_OPTIONS {
  ASCENDING = 'ascending',
  DESCENDING = 'descending'
}
