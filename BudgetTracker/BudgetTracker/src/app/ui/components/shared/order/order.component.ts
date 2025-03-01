import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  @Input() orderTypes: ORDER_BY[];
  @Input() name: string;
  @Output() orderByEvent = new EventEmitter<OrderOptions>();
  @Output() orderDirectionEvent = new EventEmitter<OrderOptions>();
  protected orderOptions: ORDER_DIRECTIONS[];
  protected selectedOrderBy: ORDER_BY;
  protected selectedOrderDirection: ORDER_DIRECTIONS;
  protected displayOrderOption: boolean;
  protected excludedTypes: ORDER_BY[];

  private orderByName: string;
  private orderDirectionName: string;

  ngOnInit(): void {
    if (!this.orderTypes) {
      throw new Error('Order options are empty');
    }

    if (!this.name) {
      throw new Error('Name is required');
    }

    this.orderByName = this.name + "-by";
    this.orderDirectionName = this.name + "-direction";

    this.excludedTypes = [
      ORDER_BY.PAID_FIRST,
      ORDER_BY.SURPLUS_FIRST
    ];

    this.orderOptions = [
      ORDER_DIRECTIONS.ASCENDING,
      ORDER_DIRECTIONS.DESCENDING,
    ]

    const orderBy = this.getFromLocalStorage(this.orderByName);
    const orderDirection = this.getFromLocalStorage(this.orderDirectionName);

    this.selectedOrderBy = this.orderTypes[this.orderTypesIndex(orderBy)];
    this.selectedOrderDirection = this.orderOptions[this.orderOptionsIndex(orderDirection)];
    this.displayOrderOption = true;
  }

  protected onOrderByChanged(): void {
    this.orderByEvent.emit(this.createOrderOption());
    this.saveToLocalStorage(this.orderByName, this.selectedOrderBy);
  }

  protected onOrderTypeChanged(): void {
    this.orderDirectionEvent.emit(this.createOrderOption());
    this.saveToLocalStorage(this.orderDirectionName, this.selectedOrderDirection);
  }

  private createOrderOption(): OrderOptions {
    return {
      orderBy: this.selectedOrderBy,
      orderDirection: this.excludedTypes
        .includes(this.selectedOrderBy) ? null : this.selectedOrderDirection
    } as OrderOptions;
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

export enum ORDER_BY {
  DATE_UPDATED = 'date updated',
  PRICE = 'price',
  REFUND = 'refund',
  WAGE = 'wage',
  REAL_COST = 'real cost',
  PAID_FIRST = 'paid first',
  SURPLUS_FIRST = 'surplus first'
}

export enum ORDER_DIRECTIONS {
  ASCENDING = 'ascending',
  DESCENDING = 'descending'
}

export class OrderOptions {
  orderBy: ORDER_BY;
  orderDirection: ORDER_DIRECTIONS | null;
}
