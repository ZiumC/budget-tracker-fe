export class LoginRequestDto {
  emailOrLogin: string;
  password: string;
  code: string | null;
}
