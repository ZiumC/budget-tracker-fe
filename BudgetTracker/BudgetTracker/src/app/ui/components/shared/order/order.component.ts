import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OrderDirection, OrderType} from "../../../../models/config/request.model.config";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  @Input() orderTypes: OrderType[];
  @Input() orderDirections: OrderDirection[];
  @Input() excludedOrderTypes: OrderType[];
  @Input() name: string;
  @Output() orderByEvent = new EventEmitter<OrderOptions>();
  @Output() orderDirectionEvent = new EventEmitter<OrderOptions>();
  protected selectedOrderBy: string;
  protected selectedOrderDirection: string;
  protected selectedOrderByIndex: number;

  private orderByName: string;
  private orderDirectionName: string;

  ngOnInit(): void {
    if (!this.orderTypes) {
      throw new Error('Order options are empty');
    }

    if (!this.orderDirections) {
      throw new Error('Order directions are empty');
    }

    if (!this.excludedOrderTypes) {
      throw new Error('Excluded order types are empty');
    }

    if (!this.name) {
      throw new Error('Name is required');
    }

    this.orderByName = this.name + "-by";
    this.orderDirectionName = this.name + "-direction";

    this.selectedOrderByIndex = this.orderTypeIndex(
      this.getValueLocalStorage(this.orderByName)
    );

    this.selectedOrderBy = this.orderTypes[this.selectedOrderByIndex].name;
    this.selectedOrderDirection =
      this.orderDirections[this.orderDirectionIndex(
        this.getValueLocalStorage(this.orderDirectionName)
      )].name;
  }

  protected onOrderByChanged(): void {
    this.orderByEvent.emit(this.createOrderOption());
    this.saveToLocalStorage(this.orderByName, this.selectedOrderBy);
  }

  protected onOrderDirectionChanged(): void {
    this.orderDirectionEvent.emit(this.createOrderOption());
    this.saveToLocalStorage(this.orderDirectionName, this.selectedOrderDirection);
    this.saveToLocalStorage(this.orderDirectionName +'-raw', this.selectedOrderDirection === 'descending' ? 'DESC' : 'ASC');
  }

  private createOrderOption(): OrderOptions {
    const orderByIndex = this.orderTypeIndex(this.selectedOrderBy);
    const orderDirectionIndex = this.orderDirectionIndex(this.selectedOrderDirection);

    const selectedOrderType = this.orderTypes[orderByIndex];
    const selectedOrderDirection = this.orderDirections[orderDirectionIndex];

    this.selectedOrderByIndex = orderByIndex;
    return {
      orderType: selectedOrderType,
      orderDirection: selectedOrderDirection
    } as OrderOptions;
  }

  private getValueLocalStorage(name: string): string | null {
    return localStorage.getItem(name);
  }

  private saveToLocalStorage(name: string, value: any): void {
    localStorage.setItem(name, value);
  }

  private orderTypeIndex(value: string | null): number {
    const foundIndex = this.orderTypes.findIndex(x => x.name === value);
    return foundIndex > -1 ? foundIndex : 0;
  }

  private orderDirectionIndex(value: string | null): number {
    const foundIndex = this.orderDirections.findIndex(x => x.name === value);
    return foundIndex > -1 ? foundIndex : 0;
  }
}

export class OrderOptions {
  orderType: OrderType;
  orderDirection: OrderDirection;
}
