export interface RequestConfig {
  pagination: Pagination;
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
