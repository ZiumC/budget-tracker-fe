enum UrlApiPart {
  API_HOST = 'https://localhost:7139/api',
  BUDGET = "/Budgets"
}

export class UrlApi {
  static getBudgets(
    page: number,
    pageSize: number,
    fromDate?: Date,
    toDate?: Date,
    orderBy?: string) {

    let urlResult = UrlApiPart.API_HOST + UrlApiPart.BUDGET +
      "?page=" + page + "&pageSize=" + pageSize;

    if (fromDate) {
      urlResult = urlResult + "&fromDate=" + fromDate;
    }

    if (toDate) {
      urlResult = urlResult + "&toDate=" + toDate;
    }

    if (orderBy) {
      urlResult = urlResult + "&orderBy=" + orderBy;
    }

    return urlResult;
  }
}
