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

export class RegisterCompleteDto {
  email: string;
  code: string;
}

export class EnrollOtpDto {
  issuer: string;
  secret: string;
  otpUri: string;
  qrCode: string;
}

export class ChangePasswordDto {
  newPassword: string;
  password: string;
}

export class ChangeEmailDto{
  email: string;
  password: string;
}
