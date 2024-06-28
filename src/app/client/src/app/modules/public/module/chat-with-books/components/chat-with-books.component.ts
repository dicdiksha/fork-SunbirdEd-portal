import {
  PaginationService, ResourceService, ConfigService, ToasterService, OfflineCardService, ILoaderMessage, UtilService, NavigationHelperService, IPagination, LayoutService, COLUMN_TYPE
} from '@sunbird/shared';
import { SearchService, OrgDetailsService, UserService, FrameworkService, SchemaService } from '@sunbird/core';
import { PublicPlayerService } from './../../../services';
import { combineLatest, Subject, of } from 'rxjs';
import { Component, OnInit, OnDestroy, EventEmitter, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash-es';
import { IInteractEventEdata, IImpressionEventInput, TelemetryService } from '@sunbird/telemetry';
import { takeUntil, map, mergeMap, first, debounceTime, tap, delay } from 'rxjs/operators';
import { CacheService } from 'ng2-cache-service';
import { ContentManagerService } from './../../offline/services';
import {omit, groupBy, get, uniqBy, toLower, find, map as _map, forEach, each} from 'lodash-es';
import { frameworkList } from './../../../../content-search/components/search-data';

@Component({
  selector: 'app-chat-with-books',
  templateUrl: './chat-with-books.component.html',
  styleUrls: ['./chat-with-books.component.scss']
})
export class ChatWithBooksComponent implements OnInit, OnDestroy, AfterViewInit {

  public showLoader = true;
  public showLoginModal = false;
  public baseUrl: string;
  public noResultMessage;
  public filterType: string;
  public queryParams: any;
  public hashTagId: string;
  public unsubscribe$ = new Subject<void>();
  public telemetryImpression: IImpressionEventInput;
  public inViewLogs = [];
  public sortIntractEdata: IInteractEventEdata;
  public dataDrivenFilters: any = {};
  public dataDrivenFilterEvent = new EventEmitter();
  public initFilters = false;
  public facets: Array<string>;
  public facetsList: any;
  public paginationDetails: IPagination;
  public contentList: Array<any> = [];
  public cardIntractEdata: IInteractEventEdata;
  public loaderMessage: ILoaderMessage;
  public numberOfSections = new Array(this.configService.appConfig.SEARCH.PAGE_LIMIT);
  showExportLoader = false;
  contentName: string;
  showDownloadLoader = false;
  frameworkId;
  public globalSearchFacets: Array<string>;
  public allTabData;
  public selectedFilters;
  public formData;
  layoutConfiguration;
  FIRST_PANEL_LAYOUT;
  SECOND_PANEL_LAYOUT;
  public totalCount;
  public searchAll;
  public allMimeType;
  downloadIdentifier: string;
  contentDownloadStatus = {};
  contentData;
  showModal = false;
  isDesktopApp = false;
  showBackButton = false;

  constructor(public searchService: SearchService, public router: Router,
    public activatedRoute: ActivatedRoute, public paginationService: PaginationService,
    public resourceService: ResourceService, public toasterService: ToasterService,
    public configService: ConfigService, public utilService: UtilService, public orgDetailsService: OrgDetailsService,
    public navigationHelperService: NavigationHelperService, private publicPlayerService: PublicPlayerService,
    public userService: UserService, public frameworkService: FrameworkService,
    public cacheService: CacheService, public navigationhelperService: NavigationHelperService, public layoutService: LayoutService,
    public contentManagerService: ContentManagerService, private offlineCardService: OfflineCardService,
    public telemetryService: TelemetryService, private schemaService: SchemaService) {
    this.paginationDetails = this.paginationService.getPager(0, 1, this.configService.appConfig.SEARCH.PAGE_LIMIT);
    this.filterType = this.configService.appConfig.explore.filterType;
  }
  ngOnInit() {
    this.isDesktopApp = this.utilService.isDesktopApp;
    this.activatedRoute.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(queryParams => {
      this.queryParams = { ...queryParams };
      if(queryParams.publisher) this.utilService.setNcertPublisher(true);
    });
    this.initLayout();
    this.moveToTop();
  }
  goback() {
    if (this.navigationhelperService['_history'].length > 1) {
      this.navigationhelperService.goBack();
    }
  }
  checkForBack() {
    if (_.get(this.activatedRoute, 'snapshot.queryParams["showClose"]') === 'true') {
      this.showBackButton = true;
    }
  }
  initLayout() {
    this.layoutConfiguration = this.layoutService.initlayoutConfig();
    this.redoLayout();
    this.layoutService.switchableLayout().
      pipe(takeUntil(this.unsubscribe$)).subscribe(layoutConfig => {
        if (layoutConfig != null) {
          this.layoutConfiguration = layoutConfig.layout;
        }
        this.redoLayout();
      });
  }
  redoLayout() {
    if (this.layoutConfiguration != null) {
      this.FIRST_PANEL_LAYOUT = this.layoutService.redoLayoutCSS(0, this.layoutConfiguration, COLUMN_TYPE.threeToNine, true);
      this.SECOND_PANEL_LAYOUT = this.layoutService.redoLayoutCSS(1, this.layoutConfiguration, COLUMN_TYPE.threeToNine, true);
    } else {
      this.FIRST_PANEL_LAYOUT = this.layoutService.redoLayoutCSS(0, null, COLUMN_TYPE.fullLayout);
      this.SECOND_PANEL_LAYOUT = this.layoutService.redoLayoutCSS(1, null, COLUMN_TYPE.fullLayout);
    }
  }
  

  moveToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }


  private setTelemetryData() {
    this.inViewLogs = []; // set to empty every time filter or page changes
    this.telemetryImpression = {
      context: {
        env: this.activatedRoute.snapshot.data.telemetry.env
      },
      edata: {
        type: this.activatedRoute.snapshot.data.telemetry.type,
        pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
        uri: this.userService.slug ? '/' + this.userService.slug + this.router.url : this.router.url,
        subtype: this.activatedRoute.snapshot.data.telemetry.subtype,
        duration: this.navigationhelperService.getPageLoadTime()
      }
    };
    this.cardIntractEdata = {
      id: 'content-card',
      type: 'click',
      pageid: this.activatedRoute.snapshot.data.telemetry.pageid
    };
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setTelemetryData();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


 public isUserLoggedIn(): boolean {
  return this.userService && (this.userService.loggedIn || false);
}

logViewAllTelemetry(event) {
  const telemetryData = {
      cdata: [{
          type: 'section',
          id: event.name
      }],
      edata: {
          id: 'view-all'
      }
  };
  this.getInteractEdata(telemetryData);
}

getInteractEdata(event) {
  const cardClickInteractData = {
      context: {
          cdata: event.cdata,
          env: this.isUserLoggedIn() ? 'library' : this.activatedRoute.snapshot.data.telemetry.env,
      },
      edata: {
          id: get(event, 'edata.id'),
          type: 'click',
          pageid: this.isUserLoggedIn() ? 'library' : this.activatedRoute.snapshot.data.telemetry.pageid
      },
      object: get(event, 'object')
  };
  this.telemetryService.interact(cardClickInteractData);
}
}