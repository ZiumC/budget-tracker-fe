export enum RegisterFormTypes {
  REGISTER = 0,
  CONFIRM_EMAIL = 1
}

export class Loaders {
  register: boolean;
  confirm: boolean;
}

export class InitRegisterDto {
  email: string;
  login: string;
  password: string;
}

export class CompleteRegisterDto {
  email: string;
  code: string;
}
