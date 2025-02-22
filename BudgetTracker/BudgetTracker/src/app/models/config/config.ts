import {Animation} from "./animation.config";
import {Timer} from "./timer.config";
import {Messages} from "./messages.config";
import {Request} from "./request.config";

export interface Config {
  app: AppConfig;
}

export interface AppConfig {
  animation: Animation;
  timer: Timer;
  messages: Messages;
  request: Request;
}
