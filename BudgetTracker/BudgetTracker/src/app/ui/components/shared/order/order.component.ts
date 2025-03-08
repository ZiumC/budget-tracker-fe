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
  protected selectedOrderDirectionIndex: number;

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

    this.selectedOrderByIndex = this.orderTypesIndex(
      this.getValueLocalStorage(this.orderByName)
    );

    this.selectedOrderBy = this.orderTypes[this.selectedOrderByIndex].name;
    this.selectedOrderDirection =
      this.orderDirections[this.orderOptionsIndex(
        this.getValueLocalStorage(this.orderDirectionName)
      )].name;
  }

  protected onOrderByChanged(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedOrderByIndex = selectElement.selectedIndex;

    this.orderByEvent.emit(this.createOrderOption());
    this.saveToLocalStorage(this.orderByName, this.selectedOrderBy);
  }

  protected onOrderTypeChanged(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedOrderDirectionIndex = selectElement.selectedIndex;

    this.orderDirectionEvent.emit(this.createOrderOption());
    this.saveToLocalStorage(this.orderDirectionName, this.selectedOrderDirection);
  }

  private createOrderOption(): OrderOptions {
    const selectedOrderType = this.orderTypes[this.selectedOrderByIndex];
    const selectedOrderDirection = this.orderDirections[this.selectedOrderDirectionIndex];
    return {
      orderType: selectedOrderType,
      orderDirection: selectedOrderType.displayDirections
        ? selectedOrderDirection : null
    } as OrderOptions;
  }

  private getValueLocalStorage(name: string): string | null {
    return localStorage.getItem(name);
  }

  private saveToLocalStorage(name: string, value: any): void {
    localStorage.setItem(name, value);
  }

  private orderTypesIndex(value: string | null): number {
    const foundIndex = this.orderTypes.findIndex(x => x.name === value);
    return foundIndex > -1 ? foundIndex : 0;
  }

  private orderOptionsIndex(value: string | null): number {
    const foundIndex = this.orderDirections.findIndex(x => x.name === value);
    return foundIndex > -1 ? foundIndex : 0;
  }
}

export class OrderOptions {
  orderType: OrderType;
  orderDirection: OrderDirection | null;
}
