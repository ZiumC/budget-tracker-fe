export class LoginDto {
  emailOrLogin: string;
  password: string;
  code: string | null;
}

export class OtpDto {
  emailOrLogin: string;
  code: string;
}

export class RegisterDto {
  email: string;
  login: string;
  password: string;
}

export class ConfirmEmailDto {
  email: string;
  code: string;
}

export class ResetPasswordDto {
  email: string;
  login: string;
}

export class SetPasswordDto {
  email: string;
  login: string;
  newPassword: string;
  challangePassword: string;
}

export class EnrollOtpDto {
  issuer: string;
  secret: string;
  otpUri: string;
  qrCode: string;
}

export class ChangePasswordDto {
  newPassword: string;
  currentPassword: string;
}
