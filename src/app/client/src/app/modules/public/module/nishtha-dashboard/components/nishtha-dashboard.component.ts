import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService, ResourceService, LayoutService, NavigationHelperService, ToasterService, ConfigService, ContentUtilsServiceService } from '@sunbird/shared';
import { CacheService } from 'ng2-cache-service';
import { Subject } from 'rxjs';
import { IInteractEventEdata, IImpressionEventInput, TelemetryService } from '@sunbird/telemetry';
import { TenantService, PublicDataService } from '@sunbird/core';
import { Location } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-nishtha-dashboard',
  templateUrl: './nishtha-dashboard.component.html',
  styleUrls: ['./nishtha-dashboard.component.scss']
})
export class NishthaDashboardComponent implements OnInit {
  layoutConfiguration: any;
  unsubscribe$ = new Subject<void>();
  public telemetryImpression: IImpressionEventInput;
  isDesktopApp = false;
  showLoader : boolean =false;
  siteUrl: string;
  sanatizedUrl: any;
  constructor(private http: HttpClient, private _cacheService: CacheService, private utilService: UtilService,
    public tenantService: TenantService, public resourceService: ResourceService, public activatedRoute: ActivatedRoute,
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

   this.sendInteractDataToTelemetry(generateUniqueId)
    
    this.siteUrl = 'https://nishthabi.akashic.dhira.io/login/?auth_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJwdXFfSXEtQVZPM1psRENmN0wxOEp6M2xpSFRGMmhzeXl4dVkza1FfQm5BIn0.eyJleHAiOjE3MDg3ODU1NDQsImlhdCI6MTcwODc4MjAwNCwianRpIjoiZGVlOTk4ODItMGJlZC00OWE3LTgyNWItODliMDA5ZGFjMWYzIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5ha2FzaGljLmRoaXJhLmlvL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiMGY4MGZjNzktNjlmZC00NTI0LThiZGEtNDJhNzJhNzljMzY5IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYWthc2hpYy1jb25zIiwic2Vzc2lvbl9zdGF0ZSI6ImUxNGM0ZDI2LTViZDUtNDA3ZC1hN2MwLWQxZTBjZDZhNjNiNyIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2FrYXNoaWMtdWktY29ucy5zMy13ZWJzaXRlLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiZTE0YzRkMjYtNWJkNS00MDdkLWE3YzAtZDFlMGNkNmE2M2I3IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJNYWhlc2ggYW5kdXJ0aGkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJtYWhlc2guYW5kdXJ0aGlAZGhpcmEuaW8iLCJnaXZlbl9uYW1lIjoiTWFoZXNoIiwiZmFtaWx5X25hbWUiOiJhbmR1cnRoaSIsImVtYWlsIjoibWFoZXNoLmFuZHVydGhpQGRoaXJhLmlvIn0.Mi3nN9hwWwAZBZN6nWg1vDsVjrR8UDEvAXFLDCIX__A8PISiF8SrcC5809zB_WsEC6KfISE4utkNxAg7tUupitlaAhhcRUClbC3ipYFd30qlu-CHSJDt9pSKAhDVxyEzTjQ6jlJgokX0sL5nDgD3mSwmjbksfl8CI8jAGA8cawieCJ5xnuUaZqWIgRo_BADfMQstsm4V4b-CkElMgegl_28TFiZIbHoimKrD4SCtJpcHIiHv52NicLTXV01WpOTNeIxvfEwYO99qqHCdaw_g4CGzgG0UjKhhUTneLWavV8P-P0NjFxxQ2ZWQVKmyq8PkL5TZrObUxDR2iJeW0limUA';
    localStorage.setItem('nishthaDashboardUrl',this.siteUrl);
   this.getUrl(this.siteUrl);
  }

  getUrl(url: any) {
    this.sanatizedUrl = this.sanatizer.bypassSecurityTrustResourceUrl(url);
    return this.sanatizedUrl;
  }
  sendInteractDataToTelemetry(uniqueId) {
    const data = {
      context: {
        env: 'Dev - Nishtha Dashboard',
        cdata: []
      },
      edata: {
        id: uniqueId,
        type: 'Nishtha Dashboard click interact',
        pageid: this.router.url.split('?')[0],
        subtype: 'Dev - Nishtha Dashboard'
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
