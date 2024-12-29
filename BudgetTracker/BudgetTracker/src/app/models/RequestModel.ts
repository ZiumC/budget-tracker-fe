export class RequestModel {
  page: number;
  pageSize: number;
  fromDate: string | null;
  toDate: string | null;
  orderBy: string | null;
}
