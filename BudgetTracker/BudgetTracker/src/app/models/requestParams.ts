export class RequestParams {
  page: number = 1;
  pageSize: number = 12;
  fromDate: string | null;
  toDate: string | null;
  orderBy: string | null;
  order: string | null;

  public constructor(init?: Partial<RequestParams>) {
    Object.assign(this, init);
  }
}
