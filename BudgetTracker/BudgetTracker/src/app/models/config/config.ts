import {Animation} from "./animation.config";
import {Timer} from "./timer.config";
import {Form} from "./form.config";
import {Request} from "./request.config";

export interface Config {
  app: AppConfig;
}

export interface AppConfig {
  animation: Animation;
  timer: Timer;
  form: Form;
  request: Request;
}
