import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {Loaders, RegisterFormTypes} from "../../../models/components/register.component";
import {ModalUtils} from "../../../util/modal.utils";
import {RegisterDto} from "../../../models/dto/user.model.dto";
import {NgModel} from "@angular/forms";
import {AppConfig} from "../../../models/config/config";
import {FormConfig} from "../../../models/config/form.model.config";
import {ConfigService} from "../../../services/config/config.service";
import {formatString} from "../../../util/string.utils";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, OnDestroy {
  protected readonly formatString = formatString;
  protected readonly FormType = RegisterFormTypes;
  protected readonly ModalUtils = ModalUtils;
  protected subscriptions: Subscription[];
  protected formType: RegisterFormTypes;
  protected registerForm: RegisterDto;
  protected repeatPassword: string;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected loaders: Loaders;

  constructor(protected configService: ConfigService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }

    this.loaders = {
      register: false
    }

    this.subscriptions = [];
    this.formType = RegisterFormTypes.REGISTER;
    this.registerForm = new RegisterDto();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected testPasswords(pass1: NgModel, pass2: NgModel): void {
    const passInput1: string = this.registerForm.password;
    const passInput2: string = this.repeatPassword;

    const minLength: number = Number(this.formConfig.registerForm.password.minLength);
    const maxLength: number = Number(this.formConfig.registerForm.password.maxLength);

    const regexPass = new RegExp(this.formConfig.regex.password);

    if (passInput1 != passInput2) {
      pass1.control.setErrors({passNotMatch: true});
      pass2.control.setErrors({passNotMatch: true});
      return;
    }

    if (passInput1.length < minLength || passInput2.length < minLength) {
      pass1.control.setErrors({minlength: true});
      pass2.control.setErrors({minlength: true});
      return;
    }

    if (passInput1.length > maxLength || passInput2.length > maxLength) {
      pass1.control.setErrors({maxlength: true});
      pass2.control.setErrors({maxlength: true});
      return;
    }

    if (!regexPass.test(this.registerForm.password) || !regexPass.test(this.repeatPassword)) {
      pass1.control.setErrors({pattern: true});
      pass2.control.setErrors({pattern: true});
      return;
    }

    pass1.control.setErrors(null);
    pass2.control.setErrors(null);
  }

}
