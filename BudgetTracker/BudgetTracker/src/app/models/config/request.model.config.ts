export interface RequestConfig {
  status: Status;
  pagination: Pagination;
  cookies: Cookies;
}

export interface Status {
  ok: number;
}

export interface Pagination {
  defaultPage: number;
  defaultBudgetsPageSize: number;
}

export interface Cookies {
  names: Names;
}

export interface Names {
  fromDate: string;
  toDate: string;
}
