import {ResponseModel} from "../response.model";

export interface UserDto {
  email: string;
  login: string;
  is2FaEnabled: boolean;
  isEmailConfirmed: boolean;
}


export interface Loaders {
  page: boolean;
  enroll2Fa: boolean;
}
