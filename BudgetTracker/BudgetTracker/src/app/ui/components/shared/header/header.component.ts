import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from "../../../../services/auth/auth.service";
import {ConfigService} from "../../../../services/config/config.service";
import {AppConfig} from "../../../../models/config/config";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  protected isMenuCollapsed: boolean = true;
  protected displayUserSubMenu: boolean = false;
  private appConfig: AppConfig;
  public innerWidth: any;

  constructor(
    protected authService: AuthService,
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
    } else {
      throw Error("Config not provided")
    }

    this.innerWidth = window.innerWidth;
    this.displayUserSubMenu = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  protected isMobileView(): boolean {
    return innerWidth <= this.appConfig.pageMobileWidth;
  }
}
