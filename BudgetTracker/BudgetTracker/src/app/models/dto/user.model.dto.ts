export class LoginDto {
  emailOrLogin: string;
  password: string;
  code: string | null;
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
