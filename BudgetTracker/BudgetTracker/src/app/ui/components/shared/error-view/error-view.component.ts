import {Component, Input, OnInit} from '@angular/core';
import {ResponseModel} from "../../../../models/response.model";
import {TimerUtils} from "../../../../util/timer.utils";
import {ConfigService} from "../../../../services/config/config.service";
import {AppConfig} from "../../../../models/config/config";

@Component({
  selector: 'app-error-view',
  templateUrl: './error-view.component.html',
  styleUrl: './error-view.component.css'
})
export class ErrorViewComponent implements OnInit {
  @Input() responseModel: ResponseModel;
  protected buttonCopyName: string;
  private appConfig: AppConfig;

  constructor(private configService: ConfigService) {
  }

  ngOnInit(): void {
    if (!this.responseModel) {
      this.responseModel = new ResponseModel();
    }

    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
    } else {
      throw Error("Config not provided")
    }

    this.buttonCopyName = "Copy";
  }

  protected copy(inputElement: any): any {
    this.buttonCopyName = "Copied";
    inputElement.select();
    //this is so far deprecated but
    //there is no any best alternatives for now
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    new TimerUtils(this.appConfig.animation.duration.default).start()
      .subscribe(finished => {
        if (finished) {
          this.buttonCopyName = "Copy";
        }
      });
  }
}
