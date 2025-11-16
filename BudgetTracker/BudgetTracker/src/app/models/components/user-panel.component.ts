export class GetUserDto {
  email: string;
  login: string;
  suspendedDate: Date;
  changeSuspendedDate: Date;
  isEmailConfirmed: boolean;
  isEnabled2Fa: boolean;
  hasEmailToConfirm: boolean;
}

export interface Loaders {
  userProfile: boolean;
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
