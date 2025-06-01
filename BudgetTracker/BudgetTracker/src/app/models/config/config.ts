import {AnimationConfig} from "./animation.model.config";
import {TimerConfig} from "./timer.model.config";
import {FormConfig} from "./form.model.config";
import {RequestConfig} from "./request.model.config";
import {ResponseConfig} from "./response.model.config";

export interface Config {
  app: AppConfig;
}

export interface AppConfig {
  animation: AnimationConfig;
  timer: TimerConfig;
  form: FormConfig;
  request: RequestConfig;
  response: ResponseConfig;
  budgetLimit: number;
  pageMobileWidth: number;
  pageMediumWidth: number;
  componentMobileWidth: number;
}
