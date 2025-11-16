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

export class InitPasswordResetDto {
  email: string;
  login: string;
  newPassword: string;
}

export class CompletePasswordResetDto {
  email: string;
  challengePassword: string;
}
