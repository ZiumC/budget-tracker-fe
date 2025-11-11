import {NgModel} from "@angular/forms";
import {FormConfig, PasswordRegex} from "../models/config/form.model.config";

export class PasswordUtil {


  constructor(private formConfig: FormConfig) {
  }

  testPasswords(password: NgModel, repeatPassword: NgModel): void {
    const passInput1: string = password.value;
    const passInput2: string = repeatPassword.value;

    const minLength: number = Number(this.formConfig.registerForm.password.minLength);
    const maxLength: number = Number(this.formConfig.registerForm.password.maxLength);

    const regexPass = new RegExp(this.combinePasswordRegex());

    password.control.markAsTouched();
    repeatPassword.control.markAsTouched();

    if (passInput1.length < minLength) {
      password.control.setErrors({minlength: true});
      return;
    }

    if (passInput1.length > maxLength) {
      password.control.setErrors({maxlength: true});
      return;
    }

    if (passInput1 != passInput2) {
      password.control.setErrors({passNotMatch: true});
      repeatPassword.control.setErrors({passNotMatch: true});
      return;
    }

    if (!regexPass.test(passInput1)) {
      password.control.setErrors({pattern: true});
      return;
    }

    password.control.setErrors(null);
    repeatPassword.control.setErrors(null);
  }

  hasSmallCharacters(password: string | null): boolean {
    if (password) {
      const regexPass = new RegExp(this.formConfig.regex.password.lowerCase);
      return regexPass.test(password);
    } else {
      return true;
    }
  }

  hasBigCharacters(password: string | null): boolean {
    if (password) {
      const regexPass = new RegExp(this.formConfig.regex.password.upperCase);
      return regexPass.test(password);
    } else {
      return true;
    }
  }

  hasNumbers(password: string | null): boolean {
    if (password) {
      const regexPass = new RegExp(this.formConfig.regex.password.digits);
      return regexPass.test(password);
    } else {
      return true;
    }
  }

  hasSpecialCharacter(password: string | null): boolean {
    if (password) {
      const regexPass = new RegExp(this.formConfig.regex.password.specialCharacter);
      return regexPass.test(password);
    } else {
      return true;
    }
  }

  private combinePasswordRegex(): string {
    const passwordRegex: PasswordRegex = this.formConfig.regex.password;
    return passwordRegex.upperCase + passwordRegex.lowerCase + passwordRegex.digits + passwordRegex.specialCharacter + passwordRegex.length
  }
}
