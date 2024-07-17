import {
  PaginationService, ResourceService, ConfigService, ToasterService, OfflineCardService, ILoaderMessage, UtilService, NavigationHelperService, IPagination, LayoutService, COLUMN_TYPE
} from '@sunbird/shared';
import { SearchService, OrgDetailsService, UserService, FrameworkService, SchemaService } from '@sunbird/core';
import { combineLatest, Subject, of } from 'rxjs';
import { Component, OnInit, OnDestroy, EventEmitter, AfterViewInit, OnChanges, SimpleChanges, DoCheck, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash-es';
import { IInteractEventEdata, IImpressionEventInput, TelemetryService } from '@sunbird/telemetry';
import { takeUntil } from 'rxjs/operators';
import { CacheService } from 'ng2-cache-service';
import { ContentManagerService } from './../../offline/services';
import { get, map as _map } from 'lodash-es';
import { LearnerService } from '../../../../../modules/core/services/learner/learner.service';
import { UUID } from 'angular2-uuid';

@Component({
  selector: 'app-chat-with-books',
  templateUrl: './chat-with-books.component.html',
  styleUrls: ['./chat-with-books.component.scss']
})
export class ChatWithBooksComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  public searchQuery: string = '';
  searchQueryList = [];
  public unsubscribe$ = new Subject<void>();
  public telemetryImpression: IImpressionEventInput;
  public inViewLogs = [];
  public dataDrivenFilterEvent = new EventEmitter();
  public contentList: Array<any> = [];
  public cardIntractEdata: IInteractEventEdata;
  sessionID = UUID.UUID();
  @ViewChild('chatData') chatData: ElementRef;
  layoutConfiguration;
  FIRST_PANEL_LAYOUT;
  SECOND_PANEL_LAYOUT;
  isDesktopApp = false;
  showBackButton = false;
  apiData = [];

  constructor(public searchService: SearchService, public router: Router,
    public activatedRoute: ActivatedRoute, public paginationService: PaginationService,
    public resourceService: ResourceService, public toasterService: ToasterService,
    public configService: ConfigService, public utilService: UtilService, public orgDetailsService: OrgDetailsService,
    public navigationHelperService: NavigationHelperService,
    public userService: UserService, public frameworkService: FrameworkService,
    public cacheService: CacheService, public navigationhelperService: NavigationHelperService, public layoutService: LayoutService,
    public contentManagerService: ContentManagerService, private offlineCardService: OfflineCardService,
    public telemetryService: TelemetryService, private schemaService: SchemaService, private learnerService: LearnerService, private renderer: Renderer2) {
  }
  ngOnInit() {
    this.sessionID = UUID.UUID();
    this.isDesktopApp = this.utilService.isDesktopApp;
    this.initLayout();
    this.getQueryFromBooks();
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

  moveToBottom() {
    setTimeout(() => {
      const scrollableDiv = document.getElementById("chat-data");
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    }, 100);

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

  ngOnChanges(changes: SimpleChanges) {

  }

  saveBooksQuery() {
    this.searchQuery = this.searchQuery.trim();
    if (!this.searchQuery) {
      return
    }
    const _uuid = UUID.UUID();
    const option = {
      url: this.configService.urlConFig.URLS.CHAT_WITH_BOOKS.SAVE,
      data: {
        "request": {
          "id": _uuid,
          "userId": this.userService.userid,
          "saveQuery": this.searchQuery
        }
      }
    }

    this.learnerService.chatWithBooks(this.configService.urlConFig.URLS.CHAT_WITH_BOOKS.AI, { question: this.searchQuery, session_id: this.sessionID }).subscribe((res: any) => {
      if (res) {
        this.apiData.push({ 'question': this.searchQuery, 'answer': res?.answer, 'reference': res?.context });
        this.searchQueryList.unshift({ 'id': _uuid, 'searchQuery': this.searchQuery });
        //save data in DB
        if (this.isUserLoggedIn()) {
          this.learnerService.postWithSubscribe(option).subscribe(res => {
            if (res.responseCode !== 'OK') {
              //no action
            }
          });
        }
        this.moveToBottom()
        this.searchQuery = '';
      }
    });



  }

  getQueryFromBooks() {
    if (this.isUserLoggedIn()) {
      let userId = this.userService.userid
      const option = {
        url: this.configService.urlConFig.URLS.CHAT_WITH_BOOKS.READ + '/' + userId,
      }
      this.learnerService.readWithSubscribe(option).subscribe(res => {
        console.log("response subscribe===", res)
        // if (res.responseCode !== 'OK') {

        // }
      });
    }
  }

}