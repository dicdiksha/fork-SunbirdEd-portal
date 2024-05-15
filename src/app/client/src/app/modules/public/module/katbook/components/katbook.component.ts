import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService, ResourceService, LayoutService, NavigationHelperService } from '@sunbird/shared';
import { CacheService } from 'ng2-cache-service';
import { Subject } from 'rxjs';
import { IImpressionEventInput, TelemetryService } from '@sunbird/telemetry';
import { Location } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import {  UserService } from '@sunbird/core'; 
@Component({
  selector: 'app-katbook',
  templateUrl: './katbook.component.html',
  styleUrls: ['./katbook.component.scss']
})
export class KatbookComponent implements OnInit {
  layoutConfiguration: any;
  unsubscribe$ = new Subject<void>();
  public telemetryImpression: IImpressionEventInput;
  isDesktopApp = false;
  showLoader : boolean =false;
  siteUrl: string;
  sanatizedUrl: any;
  tokenDetails: any;
  constructor(private utilService: UtilService,
    public resourceService: ResourceService, public activatedRoute: ActivatedRoute,
    private layoutService: LayoutService, public navigationHelperService: NavigationHelperService, private location: Location,
    private router: Router, private telemetryService: TelemetryService,  public sanatizer: DomSanitizer) { }

  ngOnInit(): void {
    this.isDesktopApp = this.utilService.isDesktopApp;
    this.setTelemetryImpression();
    this.initLayout();
    this.openWebview();
  }

  openWebview() {
    var generateUniqueId = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 20; i++ ) {
      generateUniqueId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    this.sendInteractDataToTelemetry(generateUniqueId);    
    this.siteUrl = "https://diksha.katbook.com/#/Diksha/BookView/U2FsdGVkX1/KlGcAvs2pumIukQ2hvxNmFnb13iBsBhvVbWyIYYKLn4i4WikTt+n2wfLWBYhPGLd4lduUzOZdPPlmHYQNsq8w6GZs8foq6MUz+5QSHLgUrQNf6hqIlKMEN50QWWl6EuXV2b/gLcBF/WwzzaVu5e8S0C3UuughQTeU1sLsBF54CBmMyZQJeA+d";
    this.getUrl(this.siteUrl);
  }

  getUrl(url: any) {
    this.sanatizedUrl = this.sanatizer.bypassSecurityTrustResourceUrl(url);
    return this.sanatizedUrl;
  }
  sendInteractDataToTelemetry(uniqueId) {
    const data = {
      context: {
        env: 'Dev - Katbook',
        cdata: []
      },
      edata: {
        id: uniqueId,
        type: 'Katbook click interact',
        pageid: this.router.url.split('?')[0],
        subtype: 'Dev - Katbook'
      }
    };
    this.telemetryService.interact(data);
  }

  setTelemetryImpression() {
    this.telemetryImpression = {
      context: {
        env: this.activatedRoute.snapshot.data.telemetry.env
      },
      edata: {
        type: this.activatedRoute.snapshot.data.telemetry.type,
        pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
        uri: this.router.url,
        subtype: this.activatedRoute.snapshot.data.telemetry.subtype,
        duration: this.navigationHelperService.getPageLoadTime()
      }
    };
  }

  initLayout() {
    this.layoutConfiguration = this.layoutService.initlayoutConfig();
    this.layoutService.switchableLayout().
      pipe(takeUntil(this.unsubscribe$)).subscribe(layoutConfig => {
        if (layoutConfig != null) {
          this.layoutConfiguration = layoutConfig.layout;
        }
      });
  }

  goBack() {
    this.location.back();
  }

}
