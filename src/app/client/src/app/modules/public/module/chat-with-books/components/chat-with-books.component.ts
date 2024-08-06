import {
  PaginationService, ResourceService, ConfigService, ToasterService, OfflineCardService, ILoaderMessage, UtilService, NavigationHelperService, IPagination, LayoutService, COLUMN_TYPE
} from '@sunbird/shared';
import { SearchService, OrgDetailsService, UserService, FrameworkService, SchemaService } from '@sunbird/core';
import { combineLatest, Subject, of } from 'rxjs';
import { Component, OnInit, OnDestroy, EventEmitter, AfterViewInit, SimpleChanges, DoCheck, ViewChild, ElementRef, Renderer2 } from '@angular/core';
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
export class ChatWithBooksComponent implements OnInit, OnDestroy, AfterViewInit {
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
  showLoadingMsg: boolean = false;
  selectedId: string = '';
  selectedOption = '';
  shortResponse = '';
  disabledTextarea: boolean = false;
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
    console.log("sessionID============", this.sessionID)
    this.isDesktopApp = this.utilService.isDesktopApp;
    this.initLayout();
    this.getQueryFromBooks();
    this.moveToTop()
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

  public moveToTop() {
    window.scroll({
      top: 168,
      left: 0,
      behavior: 'smooth'
    });
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

  saveBooksQuery() {
    if (!this.searchQuery && this.searchQuery.trim() == '') {
      return
    }
    this.disabledTextarea = true;
    this.showLoadingMsg = true;
    this.searchQuery = this.searchQuery.trim();
    const _uuid = UUID.UUID();
    const option = {
      url: this.configService.urlConFig.URLS.CHAT_WITH_BOOKS.SAVE,
      data: {
        "request": {
          "id": this.userService.userid, "userId": _uuid, "searchQuery": this.searchQuery
        }
      }
    }

    const todayIndex = this.searchQueryList.findIndex(item => item.hasOwnProperty('Today'));
    if (todayIndex !== -1) {
      // If "Today" exists, push new data to it
      this.searchQueryList[todayIndex]['Today'].unshift({ 'id': _uuid, 'searchQuery': this.searchQuery });
    } else {
      const newEntry = {};
      newEntry['Today'] = [{ 'id': _uuid, 'searchQuery': this.searchQuery }];
      this.searchQueryList.unshift(newEntry);
    }


    this.apiData.push({ 'question': this.searchQuery, 'answer': '', 'reference': '', 'id': _uuid });
    this.learnerService.chatWithBooks(this.configService.urlConFig.URLS.CHAT_WITH_BOOKS.AI, { question: this.searchQuery, session_id: this.sessionID }).subscribe(
      (res: any) => {
        if (res) {
          this.showLoadingMsg = false;
          this.apiData.push({ 'question': '', 'query': this.searchQuery, 'answer': res?.answer, 'reference': res?.context?.includes("Not Applicable") ? null : res?.context, 'id': _uuid });
          //save data in DB
          if (this.isUserLoggedIn()) {
            this.learnerService.postWithSubscribe(option).subscribe((res: any) => {
              if (res.responseCode !== 'OK') {
                //no action
              }
            });
          }
          this.moveToBottom()
          this.disabledTextarea = false;
        }
      },
      (error: any) => {
        this.moveToBottom()
        this.disabledTextarea = false;
      }
    )
    this.searchQuery = '';
  }

  getQueryFromBooks() {
    if (this.isUserLoggedIn()) {
      const option = {
        url: this.configService.urlConFig.URLS.CHAT_WITH_BOOKS.READ + '/' + this.userService.userid,
      }
      this.learnerService.readWithSubscribe(option).subscribe((res: any) => {
        if (res.responseCode == 'OK') {
          //let res = [{"searchQuery":"Hi Diksha\n","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"9b46b680-db58-866c-cb95-e1d219e41a50","searchQueryDate":"24-07-2024 04:44:39"},{"searchQuery":"give me some referance","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"3df04b26-5475-431d-6ad6-5e38660704f9","searchQueryDate":"25-07-2024 07:53:40"},{"searchQuery":"new chat","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"a71713e7-ef27-2463-2131-cef45cdc3f43","searchQueryDate":"24-07-2024 07:23:39"},{"searchQuery":"And how do you find a solution of an equation?","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"a3c6db2d-8cdb-4d8f-c94c-494c9a73e542","searchQueryDate":"25-07-2024 09:36:29"},{"searchQuery":"Hi Diksha","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"72be583d-b3f5-a2af-302f-7c3c1a7b139c","searchQueryDate":"24-07-2024 12:00:48"},{"searchQuery":"tell me about science","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"3719afb3-15b3-5778-2c08-06650ce79720","searchQueryDate":"24-07-2024 12:39:37"},{"searchQuery":"?","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"5d83c115-d113-69e6-00e5-d1d62f2061c3","searchQueryDate":"25-07-2024 03:58:19"},{"searchQuery":"who are endemic species?","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"c701c47e-2755-a22e-a23b-7b6d9e2b78ff","searchQueryDate":"25-07-2024 09:36:45"},{"searchQuery":"indian history","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"265e6a07-7448-8ce7-fd54-ab0a6896791d","searchQueryDate":"25-07-2024 03:58:51"},{"searchQuery":"hi sir ji","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"15ea4c49-d69f-3088-bf3b-99bd2ba8a1b6","searchQueryDate":"24-07-2024 07:27:14"},{"searchQuery":"chat with book","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"d86859b4-caab-25a0-1da6-eba359545835","searchQueryDate":"24-07-2024 12:10:59"},{"searchQuery":"tell me new","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"6b9644ca-aa90-1e35-f4cf-78ed29338b48","searchQueryDate":"30-07-2024 06:35:37"},{"searchQuery":"what is new?","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"7812a984-6d6c-5d6c-5639-93919127c4fe","searchQueryDate":"25-07-2024 07:53:29"},{"searchQuery":"what is an algebraic equation?","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"41eee248-642b-8894-5a7f-1c3fb7b502ce","searchQueryDate":"25-07-2024 09:36:02"},{"searchQuery":"what is new in diksha?\n","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"c22e8b08-0a2f-4631-5c87-b6078486e7cb","searchQueryDate":"24-07-2024 04:46:31"},{"searchQuery":"what is today","id":"4af1c209-5055-4d5b-9d4a-a72cde6b0bc6","userId":"54d9b51a-8364-ac9b-c049-b36f35f2cde4","searchQueryDate":"25-07-2024 03:37:32"}]
          const sortedSearchQueries = res?.result?.response.sort((a, b) => {
            const dateA = this.parseDate(a.searchQueryDate);
            const dateB = this.parseDate(b.searchQueryDate);
            return dateA.getTime() - dateB.getTime();
          });

          // Get today's date in 'dd-mm-yyyy' format
          const today = new Date().toLocaleDateString('en-GB').split('/').join('-');

          // Function to format date to 'dd-mm-yyyy'
          const formatDate = (dateStr) => {
            const [day, month, year] = dateStr.split('-');
            const months = { '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June', '07': 'July', '08': 'August', '09': 'September', '10': 'October', '11': 'November', '12': 'December' };
            return `${day} ${months[month]} ${year}`;
          };
          // Group data by date
          const groupedData = sortedSearchQueries.reduce((acc, item) => {
            const date = item.searchQueryDate.split(' ')[0]; // Get date part only
            const formattedDate = formatDate(date);

            if (!acc[formattedDate]) {
              acc[formattedDate] = [];
            }
            acc[formattedDate].push(item);
            return acc;
          }, {});
          // Add "Today" entry if there are items for today
          const result = Object.keys(groupedData).map(date => {
            if (date === formatDate(today)) {
              return { "Today": groupedData[date] };
            } else {
              //let day = new Date(date).toDateString()
              console.log('date', date, typeof (date))
              return { [date]: groupedData[date] };
            }
          });
          this.searchQueryList = result.reverse();
        }
      })
    }
  }

  getKeys(object) {
    return Object.keys(object);
  }

  parseDate(dateString) {
    const [day, month, year, time] = dateString.split(/[\s-]/);
    return new Date(`${year}-${month}-${day}T${time}`);
  }

  moveToQuery(queryId, searchQuery) {
    const myElement = document.getElementById(queryId);
    if (myElement) {
      const topPos = myElement.offsetTop;
      document.getElementById('chat-data').scrollTop = topPos - 10;
    } else {
      this.searchQuery = searchQuery.trim();
      this.moveToTop();
    }
  }

  sendFeedback(questionId, searchQueryResponse, shortResponse, searchQuery) {
    // if (this.isUserLoggedIn()) {
    this.shortResponse = shortResponse;
    const option = {
      url: this.configService.urlConFig.URLS.CHAT_WITH_BOOKS.UPDATE,
      data: {
        "request": {
          "id": this.userService?.userid,
          "userId": questionId,
          "searchQueryResponse": searchQueryResponse.trim(),
          "shortResponse": shortResponse.trim()
        }
      }
    }
    this.selectedOption = 'preference-selected';
    this.learnerService.saveFeedback(option).subscribe((res: any) => {
      if (res.responseCode !== 'OK') {
        //no action data saved
        this.selectedId = '';
      }
    })

    setTimeout(() => {
      this.selectedId = '';
      this.selectedOption = '';
    }, 500);
    // }
  }

  showOption(selectedId = null) {
    if (this.selectedId == selectedId) {
      this.selectedId = '';
      return
    }
    this.selectedId = selectedId;
  }

  deleteHistory() {
    this.selectedId = '';
    this.apiData = []
    this.learnerService.deleteHistory(this.configService.urlConFig.URLS.CHAT_WITH_BOOKS.DELETE_HISTORY, { session_id: this.sessionID }).subscribe((res: any) => {
      if (res) {
        this.moveToBottom()
      }
    })
  }

}