export enum EmailFormType {
  CHANGE_EMAIL = 0,
  CONFIRM_EMAIL = 1,
}

export interface UserDto {
  email: string;
  login: string;
  is2FaEnabled: boolean;
  isCurrentEmailConfirmed: boolean;
  hasNewEmailToConfirmed: boolean;
}

export interface Loaders {
  page: boolean;
  changePass: boolean;
  changeEmail: boolean;
  enable2Fa: boolean;
  enroll2Fa: boolean;
  disable2Fa: boolean;
}

export interface ChangePasswordForm {
  isDisabledForm: boolean;
  showNewPassword: boolean;
  showCurrentPassword: boolean;
  repeatPassword: string;
  passwordDto: ChangePasswordDto;
}

export interface ChangeEmailForm {
  isDisabledForm: boolean;
  showCurrentPassword: boolean;
  code: string;
  type: EmailFormType;
  emailDto: ChangeEmailDto;
}

export class ChangePasswordDto {
  newPassword: string;
  password: string;
}

export class ChangeEmailDto {
  email: string;
  password: string;
}

export class EnrollOtpDto {
  issuer: string;
  secret: string;
  otpUri: string;
  qrCode: string;
}
