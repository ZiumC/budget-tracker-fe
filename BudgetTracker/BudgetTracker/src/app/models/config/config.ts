import {Animation} from "./animation.model.config";
import {Timer} from "./timer.model.config";
import {Form} from "./form.model.config";
import {Request} from "./request.model.config";

export interface Config {
  app: AppConfig;
}

export interface AppConfig {
  animation: Animation;
  timer: Timer;
  form: Form;
  request: Request;
}
