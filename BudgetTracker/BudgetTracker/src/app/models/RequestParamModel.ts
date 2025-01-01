export class RequestParamModel {
  page: number = 1;
  pageSize: number = 12;
  fromDate: string | null;
  toDate: string | null;
  orderBy: string | null;

  public constructor(init?: Partial<RequestParamModel>) {
    Object.assign(this, init);
  }
}
