export interface FormConfig {
  messages: Messages;
  paymentModal: PaymentModal;
  incomeModal: IncomeModal;
  regex: Regex;
}

export interface Messages {
  required: string;
  minValue: string;
  minLength: string;
  maxLength: string;
  invalid: string;
  invalidFormat: string;
  notFound: string;
  range: string;
  equal: string;
  alreadyDefined: string;
}

export interface PaymentModal {
  placeholder: string;
  name: MinMaxLength;
  price: MinValueMaxLength;
  refund: MinValueMaxLength;
  comment: MinMaxLength;
}

export interface IncomeModal {
  placeholder: string;
  name: MinMaxLength;
  wage: MinValueMaxLength;
}

export interface MinMaxLength {
  minLength: string;
  maxLength: string;
}

export interface MinValueMaxLength {
  minValue: string;
  maxLength: string;
}

export interface Regex {
  money: string;
}
