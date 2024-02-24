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
    
    this.siteUrl = 'https://nishthabi.akashic.dhira.io/superset/dashboard/1/?auth_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJwdXFfSXEtQVZPM1psRENmN0wxOEp6M2xpSFRGMmhzeXl4dVkza1FfQm5BIn0.eyJleHAiOjE3MDg3Njg2OTEsImlhdCI6MTcwODc2NTE1MSwianRpIjoiYmFjMzY4Y2EtMjI2My00M2QxLWI3YTAtNjM4NjZlYmY4MGJiIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5ha2FzaGljLmRoaXJhLmlvL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiMGY4MGZjNzktNjlmZC00NTI0LThiZGEtNDJhNzJhNzljMzY5IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYWthc2hpYy1jb25zIiwic2Vzc2lvbl9zdGF0ZSI6ImNmY2I0ZmExLWNhOWMtNDg3Yy1hMmM1LWFkY2Y3M2NhODViMSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2FrYXNoaWMtdWktY29ucy5zMy13ZWJzaXRlLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiY2ZjYjRmYTEtY2E5Yy00ODdjLWEyYzUtYWRjZjczY2E4NWIxIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJNYWhlc2ggYW5kdXJ0aGkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJtYWhlc2guYW5kdXJ0aGlAZGhpcmEuaW8iLCJnaXZlbl9uYW1lIjoiTWFoZXNoIiwiZmFtaWx5X25hbWUiOiJhbmR1cnRoaSIsImVtYWlsIjoibWFoZXNoLmFuZHVydGhpQGRoaXJhLmlvIn0.RTub-9eYfV8-rhdMLSrBxyKUjoCemPMZy2rpdtJmoEurmEPAzDd8hFtC9UxIlmUY_bzf9wP91rlvSsJzS5MO8hRWuFEUxEZ-G-1FdeFYpvlb7bui8hFA0EnCxbsuQEwnsNipGNrpIuF90OMtlfKZxDk3u5aQFaN_e3_7mLEt469aCkEIx57seS85a0f7iDXmIoPUeGRg7wwaKRS5SGFwT81oUptqr3cjj32nXnq_OI_NNHuIKuftK0vei5trARkcsy6DJSsbD3OgCQomuz9CudodNQmrI330-4LJr-L59D18aztlczf48FRA7hv8C1HK0T7ChQAZygAdgdUM5zkboA';
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
