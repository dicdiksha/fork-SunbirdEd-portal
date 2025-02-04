import {
  PaginationService, ResourceService, ConfigService, ToasterService, OfflineCardService, ILoaderMessage, UtilService, NavigationHelperService, IPagination, LayoutService, COLUMN_TYPE
} from '@sunbird/shared';
import { SearchService, OrgDetailsService, UserService, FrameworkService, SchemaService } from '@sunbird/core';
import { PublicPlayerService } from '../../../../services';
import { combineLatest, Subject, of } from 'rxjs';
import { Component, OnInit, OnDestroy, EventEmitter, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash-es';
import { IInteractEventEdata, IImpressionEventInput, TelemetryService } from '@sunbird/telemetry';
import { takeUntil, map, mergeMap, first, debounceTime, tap, delay } from 'rxjs/operators';
import { CacheService } from 'ng2-cache-service';
import { ContentManagerService } from '../../../offline/services';
import {omit, groupBy, get, uniqBy, toLower, find, map as _map, forEach, each} from 'lodash-es';
import { frameworkList } from './../../../../../content-search/components/search-data';
@Component({
  templateUrl: './explore-content.component.html',
  styleUrls: ['./explore-content.component.scss']
})
export class ExploreContentComponent implements OnInit, OnDestroy, AfterViewInit {

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
    this.searchService.getContentTypes().pipe(takeUntil(this.unsubscribe$)).subscribe(formData => {
      this.allTabData = _.find(formData, (o) => o.title === 'frmelmnts.tab.all');
      this.formData = formData;
      this.globalSearchFacets = (this.queryParams && this.queryParams.searchFilters) ?
      JSON.parse(this.queryParams.searchFilters) : _.get(this.allTabData, 'search.facets');
      this.listenLanguageChange();
      this.initFilters = true;
    }, error => {
      this.toasterService.error(this.resourceService.frmelmnts.lbl.fetchingContentFailed);
      this.navigationhelperService.goBack();
    });

    this.initLayout();
    this.frameworkService.channelData$.pipe(takeUntil(this.unsubscribe$)).subscribe((channelData) => {
      if (!channelData.err) {
        this.frameworkId = _.get(channelData, 'channelData.defaultFramework');
      }
    });
    this.orgDetailsService.getOrgDetails(this.userService.slug).pipe(
      mergeMap((orgDetails: any) => {
        this.hashTagId = orgDetails.hashTagId;
        this.initFilters = true;
        return this.dataDrivenFilterEvent;
      }), first()
    ).subscribe((filters: any) => {
      this.dataDrivenFilters = filters;
      this.fetchContentOnParamChange();
      this.setNoResultMessage();
    },
      error => {
        this.router.navigate(['']);
      }
    );
    this.searchAll = this.resourceService.frmelmnts.lbl.allContent;
    this.contentManagerService.contentDownloadStatus$.subscribe( contentDownloadStatus => {
      this.contentDownloadStatus = contentDownloadStatus;
      this.addHoverData();
    });
    this.checkForBack();
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
  public getFilters(filters) {
    const filterData = filters && filters.filters || {};
    if (filterData.channel && this.facets) {
      const channelIds = [];
      const facetsData = _.find(this.facets, { 'name': 'channel' });
      _.forEach(filterData.channel, (value, index) => {
        const data = _.find(facetsData.values, { 'identifier': value });
        if (data) {
          channelIds.push(data.name);
        }
      });
      if (channelIds && Array.isArray(channelIds) && channelIds.length > 0) {
        filterData.channel = channelIds;
      }
    }
    this.selectedFilters = filterData;
    const defaultFilters = _.reduce(filters, (collector: any, element) => {
      if (element.code === 'board') {
        collector.board = _.get(_.orderBy(element.range, ['index'], ['asc']), '[0].name') || '';
      }
      return collector;
    }, {});
    this.dataDrivenFilterEvent.emit(defaultFilters);
  }
  private fetchContentOnParamChange() {
    combineLatest(this.activatedRoute.params, this.activatedRoute.queryParams, this.schemaService.fetchSchemas())
      .pipe(debounceTime(5),
        tap(data => this.inView({ inview: [] })),
        delay(10),
        tap(data => this.setTelemetryData()),
        map(result => ({ params: { pageNumber: Number(result[0].pageNumber) }, queryParams: result[1] })),
        takeUntil(this.unsubscribe$)
      ).subscribe(({ params, queryParams }) => {
        this.showLoader = true;
        this.paginationDetails.currentPage = params.pageNumber;
        this.queryParams = { ...queryParams };
        this.contentList = [];
        this.fetchContents();
      });
  }

  private generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
  }
  private fetchContents() {
    const pathname = window.location.pathname.split('/')[1];
    const selectedMediaType = _.isArray(_.get(this.queryParams, 'mediaType')) ? _.get(this.queryParams, 'mediaType')[0] :
      _.get(this.queryParams, 'mediaType');
    const mimeType = _.find(_.get(this.allTabData, 'search.filters.mimeType'), (o) => {
      return o.name === (selectedMediaType || 'all');
    });
    const pageType = _.get(this.queryParams, 'pageTitle');
    const filters: any = this.schemaService.schemaValidator({
      inputObj: this.queryParams || {}, properties: _.get(this.schemaService.getSchema('content'), 'properties') || {},
      omitKeys: ['key', 'sort_by', 'sortType', 'appliedFilters', 'softConstraints', 'selectedTab', 'description', 'mediaType', 'contentType', 'searchFilters', 'utm_source']
    });
    if (!filters.channel) {
      filters.channel = this.hashTagId;
    }
    const _filters = _.get(this.allTabData, 'search.filters');
    filters.primaryCategory = filters.primaryCategory || ((_.get(filters, 'primaryCategory.length') && filters.primaryCategory) || _.get(this.allTabData, 'search.filters.primaryCategory'));
    filters.mimeType = filters.mimeType || _.get(mimeType, 'values');
    _.forEach(_filters, (el, key) => {
      if (key !== 'primaryCategory' && key !== 'mimeType' && !_.has(filters, key)) {
        filters[key] = el;
      }
    });

  
    _.forEach(this.formData, (form, key) => {
      const pageTitle = _.get(this.resourceService, form.title);
      if (pageTitle && pageType && (pageTitle === pageType)) {
        filters.contentType = filters.contentType || _.get(form, 'search.filters.contentType');
      }
    });
    //const softConstraints = _.get(this.activatedRoute.snapshot, 'data.softConstraints') || {};
    // Openforgeid 133157 remove softConstraints for ALL tab
    let softConstraints = _.get(this.activatedRoute.snapshot, 'data.softConstraints') || {};
    
    softConstraints = this.userService.slug ? {} : softConstraints;

    if (this.queryParams.key) {
      delete softConstraints['board'];
    }

    // added dummy field in ES query request
    let queryFields = _.get(this.allTabData, 'search.fields');
    const baseFieldName = "dummy_field_";
    const randomString = this.generateRandomString(20);
    const dummyFieldName = baseFieldName + randomString;

    const existingIndex = queryFields.findIndex(field => field.startsWith(baseFieldName));

    if (existingIndex !== -1) {
      queryFields[existingIndex] = dummyFieldName;
    } else {
      queryFields.push(dummyFieldName);
    }
	
    const option: any = {
      filters: _.omitBy(filters || {}, value => _.isArray(value) ? (!_.get(value, 'length') ? true : false) : false),
      fields: queryFields,//_.get(this.allTabData, 'search.fields'),
      limit: _.get(this.allTabData, 'search.limit') ?  _.get(this.allTabData, 'search.limit')
      : this.configService.appConfig.SEARCH.PAGE_LIMIT,
      pageNumber: this.paginationDetails.currentPage,
      query: this.queryParams.key,
      sort_by: {lastPublishedOn: 'desc'},
      mode: 'soft',
      softConstraints: softConstraints,
      facets: this.globalSearchFacets,
      params: this.configService.appConfig.ExplorePage.contentApiQueryParams || {}
    };
    _.filter(Object.keys(this.queryParams),filterValue => { 
      if(((_.get(this.allTabData , 'search.facets').indexOf(filterValue) !== -1)))
      {
          option.filters[filterValue] = (typeof(this.queryParams[filterValue]) === "string" ) ? this.queryParams[filterValue].split(',') : this.queryParams[filterValue];

      }
  });
    if (this.queryParams.softConstraints) {
      try {
        option.softConstraints = JSON.parse(this.queryParams.softConstraints);
      } catch {

      }
    }
    if (this.frameworkId) {
      option.params.framework = this.frameworkId;
    }
    // Replacing cbse/ncert value with cbse
    //117337 - removed hardcoded cbse/ncert
    if (_.toLower(_.get(filters, 'board[0]')) === 'cbse/ncert' || _.toLower(_.get(filters, 'board')) === 'cbse/ncert') {
            filters.board = ['cbse'];
        }
    const cbseNcertExists = [_.get(filters, 'board[0]'), _.get(filters, 'board'), _.get(filters, 'se_boards[0]'), _.get(filters, 'se_boards')].some(board => _.toLower(board) === 'cbse/ncert');
  //   if (_.toLower(_.get(filters, 'board[0]')) === 'cbse' || _.toLower(_.get(filters, 'board')) === 'cbse') {
  //     filters.board = ['cbse'];
  // }
  //   const cbseNcertExists = [_.get(filters, 'board[0]'), _.get(filters, 'board'), _.get(filters, 'se_boards[0]'), _.get(filters, 'se_boards')].some(board => _.toLower(board) === 'cbse');
    if (cbseNcertExists) {
      option.filters.se_boards = ['CBSE'];
    } else {
      if(pathname != 'explore' && this.queryParams.selectedTab ==="all"){
        option.filters.se_boards =  [ frameworkList[pathname]['name']];
      }

    }
    // To empty se_boards when NCERT is selected as NCERT board is not bind to any content
    if(option.filters.se_boards && option.filters.se_boards.length>0 && _.toLower(option.filters.se_boards).includes('ncert')){
      option.filters.se_boards = [];
    }
    this.searchService.contentSearch(option)
      .pipe(
        mergeMap(data => {
        //   const { subject: selectedSubjects = [] } = (this.selectedFilters || {}) as { subject: [] };
        //   const filteredContents = omit(groupBy(get(data, 'result.content') || get(data, 'result.QuestionSet'), content => {
        //     return ((this.queryParams['primaryCategory'] && this.queryParams['primaryCategory'].length > 0) ? content['subject'] : content['primaryCategory']);
        // }), ['undefined']);
        // for (const [key, value] of Object.entries(filteredContents)) {
        //     const isMultipleSubjects = key && key.split(',').length > 1;
        //     if (isMultipleSubjects) {
        //         const subjects = key && key.split(',');
        //         subjects.forEach((subject) => {
        //             if (filteredContents[subject]) {
        //                 filteredContents[subject] = uniqBy(filteredContents[subject].concat(value), 'identifier');
        //             } else {
        //                 filteredContents[subject] = value;
        //             }
        //         });
        //         delete filteredContents[key];
        //     }
        // }
       // const sections = [];
        // for (const section in filteredContents) {
        //     if (section) {
        //         if (selectedSubjects.length && !(find(selectedSubjects, selectedSub => toLower(selectedSub) === toLower(section)))) {
        //             continue;
        //         }
        //         sections.push({
        //             name: section,
        //             contents: filteredContents[section]
        //         });
        //     }
        // }
        // _map(sections, (section) => {
        //     forEach(section.contents, contents => {
        //         contents.cardImg = contents.appIcon || 'assets/images/book.png';
        //     });
        //     return section;
        // });
        //this.contentList = sections;
        if(get(data, 'result.content') && get(data, 'result.QuestionSet')){
          this.contentList = _.concat(get(data, 'result.content'), get(data, 'result.QuestionSet'));
        } else if(get(data, 'result.content')){
          this.contentList = get(data, 'result.content');
        } else {
          this.contentList = get(data, 'result.QuestionSet');
        }
        this.addHoverData();
          const channelFacet = _.find(_.get(data, 'result.facets') || [], facet => _.get(facet, 'name') === 'channel');
          if (channelFacet) {
            const rootOrgIds = this.orgDetailsService.processOrgData(_.get(channelFacet, 'values'));
            return this.orgDetailsService.searchOrgDetails({
              filters: { isTenant: true, id: rootOrgIds },
              fields: ['slug', 'identifier', 'orgName']
            }).pipe(
              mergeMap(orgDetails => {
                channelFacet.values = _.get(orgDetails, 'content');
                return of(data);
              })
            );
          }
          return of(data);
        })
      )
      .subscribe(data => {
        this.showLoader = false;
        this.facets = this.searchService.updateFacetsData(_.get(data, 'result.facets'));
        this.facetsList = this.searchService.processFilterData(_.get(data, 'result.facets'));
        this.paginationDetails = this.paginationService.getPager(data.result.count, this.paginationDetails.currentPage,
          this.configService.appConfig.SEARCH.PAGE_LIMIT);
        this.totalCount = data.result.count;
        this.setNoResultMessage();
      }, err => {
        this.showLoader = false;
        this.contentList = [];
        this.facetsList = [];
        this.totalCount = 0;
        this.paginationDetails = this.paginationService.getPager(0, this.paginationDetails.currentPage,
          this.configService.appConfig.SEARCH.PAGE_LIMIT);
        this.toasterService.error(this.resourceService.messages.fmsg.m0051);
      });
  }

  addHoverData() {
    this.contentList = this.utilService.addHoverData(this.contentList, true);  
  }
  moveToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
  public navigateToPage(page: number): void {
    if (page < 1 || page > this.paginationDetails.totalPages) {
      return;
    }
    const url = this.router.url.split('?')[0].replace(/[^\/]+$/, page.toString());
    this.router.navigate([url], { queryParams: this.queryParams });
    this.moveToTop();
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
  public playContent(event) {
    this.publicPlayerService.playContent(event);
  }
  public inView(event) {
    _.forEach(event.inview, (elem, key) => {
      const obj = _.find(this.inViewLogs, { objid: elem.data.identifier });
      if (!obj) {
        this.inViewLogs.push({
          objid: elem.data.identifier,
          objtype: elem.data.contentType || 'content',
          index: elem.id
        });
      }
    });

    if (this.telemetryImpression) {
      this.telemetryImpression.edata.visits = this.inViewLogs;
      this.telemetryImpression.edata.subtype = 'pageexit';
      this.telemetryImpression = Object.assign({}, this.telemetryImpression);
    }
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

  private listenLanguageChange() {
    this.resourceService.languageSelected$.pipe(takeUntil(this.unsubscribe$)).subscribe((languageData) => {
      this.setNoResultMessage();
      if (_.get(this.contentList, 'length') ) {
        if (this.isDesktopApp) {
          this.addHoverData();
        }
        this.facets = this.searchService.updateFacetsData(this.facets);
      }
    });
  }

  private setNoResultMessage() {
    this.resourceService.languageSelected$.subscribe(item => {
    let title = this.utilService.transposeTerms(get(this.resourceService, 'frmelmnts.lbl.noBookfoundTitle'), 'frmelmnts.lbl.noBookfoundTitle', get(item, 'value'));    
    if (this.queryParams.key) {
      const title_part1 = _.replace(this.resourceService.frmelmnts.lbl.desktop.yourSearch, '{key}', this.queryParams.key);
      const title_part2 = this.resourceService.frmelmnts.lbl.desktop.notMatchContent;
      title = title_part1 + ' ' + title_part2;
    }
      this.noResultMessage = {
        'title': title,
        'subTitle': this.utilService.transposeTerms(get(this.resourceService, 'frmelmnts.lbl.noBookfoundSubTitle'), 'frmelmnts.lbl.noBookfoundSubTitle', get(item, 'value')),
        'buttonText': this.utilService.transposeTerms(get(this.resourceService, 'frmelmnts.lbl.noBookfoundButtonText'), 'frmelmnts.lbl.noBookfoundButtonText', get(item, 'value')),
        'showExploreContentButton': false
      };
      
    });
    
  }

  updateCardData(downloadListdata) {
    _.each(this.contentList, (contents) => {
      this.publicPlayerService.updateDownloadStatus(downloadListdata, contents);
    });
  }

  hoverActionClicked(event) {
    event['data'] = event.content;
    this.contentName = event.content.name;
    this.contentData = event.data;
    let telemetryButtonId: any;
    switch (event.hover.type.toUpperCase()) {
      case 'OPEN':
        this.playContent(event);
        this.logTelemetry(this.contentData, 'play-content');
        break;
      case 'DOWNLOAD':
        this.downloadIdentifier = _.get(event, 'content.identifier');
        this.showModal = this.offlineCardService.isYoutubeContent(this.contentData);
        if (!this.showModal) {
          this.showDownloadLoader = true;
          this.downloadContent(this.downloadIdentifier);
        }
        telemetryButtonId = this.contentData.mimeType ===
          'application/vnd.ekstep.content-collection' ? 'download-collection' : 'download-content';
        this.logTelemetry(this.contentData, telemetryButtonId);
        break;
    }
  }

  callDownload() {
    this.showDownloadLoader = true;
    this.downloadContent(this.downloadIdentifier);
  }

  downloadContent(contentId) {
    this.contentManagerService.downloadContentId = contentId;
    this.contentManagerService.downloadContentData = this.contentData;
    this.contentManagerService.failedContentName = this.contentName;
    this.contentManagerService.startDownload({})
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.downloadIdentifier = '';
        this.contentManagerService.downloadContentId = '';
        this.contentManagerService.downloadContentData = {};
        this.contentManagerService.failedContentName = '';
        this.showDownloadLoader = false;
      }, error => {
        this.downloadIdentifier = '';
        this.contentManagerService.downloadContentId = '';
        this.contentManagerService.downloadContentData = {};
        this.contentManagerService.failedContentName = '';
        this.showDownloadLoader = false;
        _.each(this.contentList, (content) => {
          content['downloadStatus'] = this.resourceService.messages.stmsg.m0138;
        });
        if (!(error.error.params.err === 'LOW_DISK_SPACE')) {
          this.toasterService.error(this.resourceService.messages.fmsg.m0090);
        }
      });
  }

logTelemetry(content, actionId) {
    const telemetryInteractObject = {
      id: content.identifier,
      type: content.contentType,
      ver: content.pkgVersion ? content.pkgVersion.toString() : '1.0'
    };

    const appTelemetryInteractData: any = {
      context: {
        env: _.get(this.activatedRoute, 'snapshot.root.firstChild.data.telemetry.env') ||
          _.get(this.activatedRoute, 'snapshot.data.telemetry.env') ||
          _.get(this.activatedRoute.snapshot.firstChild, 'children[0].data.telemetry.env')
      },
      edata: {
        id: actionId,
        type: 'click',
        pageid: this.router.url.split('/')[1] || 'explore-page'
      }
    };

    if (telemetryInteractObject) {
      if (telemetryInteractObject.ver) {
        telemetryInteractObject.ver = _.isNumber(telemetryInteractObject.ver) ?
          _.toString(telemetryInteractObject.ver) : telemetryInteractObject.ver;
      }
      appTelemetryInteractData.object = telemetryInteractObject;
    }
    this.telemetryService.interact(appTelemetryInteractData);
  }
  public viewAll(event) {
    this.moveToTop();
    this.logViewAllTelemetry(event);
    const searchQueryParams: any = {};
    searchQueryParams.defaultSortBy = JSON.stringify({ lastPublishedOn: 'desc' });
    searchQueryParams['exists'] = undefined;
    searchQueryParams['primaryCategory'] = (this.queryParams.primaryCategory && this.queryParams.primaryCategory.length) ?
     this.queryParams.primaryCategory : [event.name];
    (this.queryParams.primaryCategory && this.queryParams.primaryCategory.length) ? (searchQueryParams['subject'] = [event.name]) :
    (searchQueryParams['se_subjects'] = this.queryParams.se_subjects);
    searchQueryParams['selectedTab'] = 'all';
    if (this.queryParams.channel) {
      searchQueryParams['channel'] = this.queryParams.channel;
    }
    searchQueryParams['visibility'] = [];
    searchQueryParams['appliedFilters'] = true;
    const sectionUrl = '/explore' + '/view-all/' + event.name.replace(/\s/g, '-');
    this.router.navigate([sectionUrl, 1], { queryParams: searchQueryParams, state: {} });
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

