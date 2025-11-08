export interface FormConfig {
  messages: Messages;
  paymentModal: PaymentModal;
  incomeModal: IncomeModal;
  budgetModal: BudgetModal;
  categoryModal: CategoryModal;
  loginForm: LoginForm;
  registerForm: RegisterForm;
  regex: Regex;
}

export interface Messages {
  required: string;
  minValue: string;
  minLength: string;
  maxLength: string;
  invalid: string;
  invalidFormat: string;
  tooFuture: string;
  notFound: string;
  range: string;
  equal: string;
  alreadyDefined: string;
  wageTooLow: string;
  savingsTooBig: string;
  passNotMatch: string;
  typeahead: Typehead;
}

export interface Typehead {
  notfound: string;
}

export interface CategoryModal {
  name: MinMaxLength;
  description: MinMaxLength;
  needsName: string;
  wantsName: string;
  savingsName: string;
}

export interface PaymentModal {
  placeholder: string;
  name: MinMaxLength;
  price: MinValueMaxLength;
  refund: MinValueMaxLength;
  comment: MinMaxLength;
  commentAssignment: MinMaxLength;
}

export interface IncomeModal {
  placeholder: string;
  name: MinMaxLength;
  wage: MinValueMaxLength;
}

export interface BudgetModal {
  name: MinMaxLength;
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
  loginOrEmail: string;
  email: string;
  password: string;
  otp: string;
}

export interface LoginForm {
  emailOrLogin: MinMaxLength;
  password: MinMaxLength;
  code: MinMaxLength;
}

export interface RegisterForm {
  email: MinMaxLength;
  login: MinMaxLength;
  password: MinMaxLength;
}
