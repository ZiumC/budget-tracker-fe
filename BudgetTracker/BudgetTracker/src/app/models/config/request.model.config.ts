export interface RequestConfig {
  pagination: Pagination;
  order: Order;
  cookies: Cookies;
}

export interface Pagination {
  defaultPage: number;
  defaultBudgetsPageSize: number;
  defaultPageSizeOptions: number[];
  incomesPageSize: number;
  paymentsPageSize: number;
}

export interface Cookies {
  names: Names;
}

export interface Names {
  fromDate: string;
  toDate: string;
}

export interface Order {
  incomeTypes: OrderType[];
  paymentTypes: OrderType[];
  excludedTypes: OrderType[];
  orderDirections: OrderDirection[];
}

export interface OrderType {
  name: string;
  value: string;
  displayDirections: boolean;
  applyForApi: boolean;
}

export interface OrderDirection {
  name: string;
  value: string;
}


