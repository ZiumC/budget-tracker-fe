export interface ResponseConfig {
  required: RequiredStatus;
}

export interface RequiredStatus {
  budgetStatus: number;
  incomeStatus: number;
  paymentStatus: number;
  plannedPaymentStatus: number;
  categoryStatus: number;
  budgetStatsStatus: number;
}
