export interface UserDto {
  email: string;
  login: string;
  is2FaEnabled: boolean;
  isEmailConfirmed: boolean;
}


export interface Loaders {
  page: boolean;
  enable2Fa: boolean;
  enroll2Fa: boolean;
  disable2Fa: boolean;
}
