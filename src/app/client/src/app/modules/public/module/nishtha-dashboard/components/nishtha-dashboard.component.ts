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
    
    this.siteUrl = 'http://nishtha-dashboard.diksha.gov.in/login/?diksha_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhaE41YnpBQl95eDgzVTZBNlFZOFeyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhaE41YnpBQl95eDgzVTZBNlFZOF9XcjFkUWpJSzJ2d0FvUmQ2M0Y2T05ZIn0.eyJqdGkiOiI1YjcxYjNhNy1hYWRkLTRmN2QtYjZiOS01ODBiNTY5OWUxOTgiLCJleHAiOjE3MDg4MTM1NTEsIm5iZiI6MCwiaWF0IjoxNzA4NzcwMzUxLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0L2F1dGgvcmVhbG1zL3N1bmJpcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNWY4OGFmNzYtMGJmZi00YWRiLTgzYzEtZTYwMDIwNTYzN2I4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibmlzaHRoYS1kYXNoYm9hcmQiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJhMjVlZDFlYy04MWJkLTQzYTEtYWIyMi1kZTc0MGUwNDdmMWMiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJNYWhlc2ggS3Jpc2huYWlhaCIsInByZWZlcnJlZF91c2VybmFtZSI6Im5pc2h0aGEtdXNlciIsImdpdmVuX25hbWUiOiJNYWhlc2giLCJmYW1pbHlfbmFtZSI6IktyaXNobmFpYWgiLCJlbWFpbCI6Im1haGVzaC5rcmlzaG5haWFoQHRyaWd5bi5jb20ifQ.YliXhd1Ns3-GRuWjsCTXEcQxuAgLHJFXPxoaMiNVPtkGDmAcZ84eSPZkRar3lpiNiSrr7Fp_rh2W7EvH0Xna8iAa7pVk2nEHvL2yihyI6DhuK8RzjfJK-_xZWC-adJtwwBdJApCw1tXBqKXrZH_B0tYSZ_V-AsYzajlNyFsSFpTYSLO4nJ8xEraDt3O6MqnHwKeyDRRnAF-M3x3soOV3gk_GDJaHcfKedZAok1GeqfJbEQ0YW_boaL4TShi1FH9TxR3t3LmAmdiImhBVdDcoaBfN_eXbS8IaaTvMn9Rg1LF3LUHAxlq-k3w-_gjs0A-l_TVVnlELw1axm8jQPRCMPg';
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
