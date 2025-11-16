export interface UserProfileDto {
  email: string;
  login: string;
  suspendedDate: Date;
  changeSuspendedDate: Date;
  isEmailConfirmed: boolean;
  is2FaEnabled: boolean;
  hasEmailToConfirm: boolean;
}

export class OtpDto {
  emailOrLogin: string;
  code: string;
}
