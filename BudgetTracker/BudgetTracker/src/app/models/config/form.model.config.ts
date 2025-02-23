import {Regex} from "./regex.model.config";

export interface Form {
  messages: Messages;
  paymentModal: PaymentModal;
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

export interface PaymentModal{
  placeholder: string;
  name: MinMaxLength;
  price: MinValueMaxLength;
  refund: MinValueMaxLength;
  comment: MinMaxLength;
}

export interface MinMaxLength {
  minLength: string;
  maxLength: string;
}

export interface MinValueMaxLength {
  minValue: string;
  maxLength: string;
}

