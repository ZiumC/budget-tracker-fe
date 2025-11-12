import {ChangeEmailDto, ChangePasswordDto} from "../dto/user.model.dto";

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
