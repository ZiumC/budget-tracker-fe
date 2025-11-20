import {Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
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
  @ViewChild('userMenu') menu: ElementRef;

  constructor(
    protected authService: AuthService,
    private configService: ConfigService,
    private renderer: Renderer2) {
    this.renderer.listen('window', 'click', (e: Event): void => {
      let personIcon = this.menu.nativeElement.firstChild;
      if (e.target !== this.menu.nativeElement && e.target !== personIcon) {
        this.displayUserSubMenu = false;
      }
    });
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
