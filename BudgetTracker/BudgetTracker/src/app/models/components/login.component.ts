export enum LoginFormTypes {
  LOGIN = 0,
  RESET_PASSWORD = 1,
  CONFIRM_PASSWORD = 2
}

export class Loaders {
  login: boolean;
  reset: boolean;
  setPass: boolean;
}

export class LoginDto {
  emailOrLogin: string;
  password: string;
  code: string | null;
}

export class InitPassResetDto {
  email: string;
  login: string;
  newPassword: string;
}

export class CompletePassResetDto {
  email: string;
  challengePassword: string;
}
