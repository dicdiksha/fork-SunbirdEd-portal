import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService, ResourceService, LayoutService, NavigationHelperService, ToasterService, ConfigService, ContentUtilsServiceService } from '@sunbird/shared';
import { CacheService } from 'ng2-cache-service';
import { Observable, Subject, Subscription } from 'rxjs';
import { IImpressionEventInput, TelemetryService } from '@sunbird/telemetry';
import { Location } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import {  UserService } from '@sunbird/core'; 
import {  IUserData } from '@sunbird/shared';
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
  userSubscription: Subscription;
  userProfile:any;
  tokenDetails: any;
  constructor(private http: HttpClient, private _cacheService: CacheService, private utilService: UtilService,
    public resourceService: ResourceService, public activatedRoute: ActivatedRoute, public userService: UserService,
    private layoutService: LayoutService, public navigationHelperService: NavigationHelperService, private location: Location,
    private router: Router, private telemetryService: TelemetryService,  public sanatizer: DomSanitizer) { }

  ngOnInit(): void {
    this.isDesktopApp = this.utilService.isDesktopApp;
    this.userSubscription = this.userService.userData$.subscribe((user: IUserData) => {
      if (user.userProfile) {
        this.userProfile = user.userProfile;
      }
    });
    this.setTelemetryImpression();
    this.initLayout();
    this.openWebview();
  }

  getToken(): Observable<any>{
    const URL = "https://diksha.gov.in/auth/realms/sunbird/protocol/openid-connect/token";
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let input=`client_id=ntp-support-tool&username=reportadmin@teamdiksha.org&grant_type=password&password=&client_secret=58d30df4-c5c7-48d4-906c-aa33b673e3c2`;
    return this.http.post(URL,input,{headers:headers});
  }

  openWebview() {
    var generateUniqueId = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 20; i++ ) {
      generateUniqueId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    let token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhaE41YnpBQl95eDgzVTZBNlFZOFeyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhaE41YnpBQl95eDgzVTZBNlFZOF9XcjFkUWpJSzJ2d0FvUmQ2M0Y2T05ZIn0.eyJqdGkiOiI1YjcxYjNhNy1hYWRkLTRmN2QtYjZiOS01ODBiNTY5OWUxOTgiLCJleHAiOjE3MDg4MTM1NTEsIm5iZiI6MCwiaWF0IjoxNzA4NzcwMzUxLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0L2F1dGgvcmVhbG1zL3N1bmJpcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNWY4OGFmNzYtMGJmZi00YWRiLTgzYzEtZTYwMDIwNTYzN2I4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibmlzaHRoYS1kYXNoYm9hcmQiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJhMjVlZDFlYy04MWJkLTQzYTEtYWIyMi1kZTc0MGUwNDdmMWMiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJNYWhlc2ggS3Jpc2huYWlhaCIsInByZWZlcnJlZF91c2VybmFtZSI6Im5pc2h0aGEtdXNlciIsImdpdmVuX25hbWUiOiJNYWhlc2giLCJmYW1pbHlfbmFtZSI6IktyaXNobmFpYWgiLCJlbWFpbCI6Im1haGVzaC5rcmlzaG5haWFoQHRyaWd5bi5jb20ifQ.YliXhd1Ns3-GRuWjsCTXEcQxuAgLHJFXPxoaMiNVPtkGDmAcZ84eSPZkRar3lpiNiSrr7Fp_rh2W7EvH0Xna8iAa7pVk2nEHvL2yihyI6DhuK8RzjfJK-_xZWC-adJtwwBdJApCw1tXBqKXrZH_B0tYSZ_V-AsYzajlNyFsSFpTYSLO4nJ8xEraDt3O6MqnHwKeyDRRnAF-M3x3soOV3gk_GDJaHcfKedZAok1GeqfJbEQ0YW_boaL4TShi1FH9TxR3t3LmAmdiImhBVdDcoaBfN_eXbS8IaaTvMn9Rg1LF3LUHAxlq-k3w-_gjs0A-l_TVVnlELw1axm8jQPRCMPg';
    if(this.isUserLoggedIn) {
      this.getToken().subscribe(res=>{
        console.log("res--->",res);
        if(res) {
          token = res.access_token;
        }
      });
    }
    this.sendInteractDataToTelemetry(generateUniqueId);    
    this.siteUrl = 'https://course-data.diksha.gov.in/login/?diksha_token='+token+"&redirect=/bi/dashboard/course-dashboard/?standalone=1&show_filters=0";
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

  public isUserLoggedIn(): boolean {
    return this.userService && (this.userService.loggedIn || false);
  }

}
