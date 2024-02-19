import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormService, UserService } from '@sunbird/core';
import * as _ from 'lodash-es';
import { LayoutService, ResourceService, UtilService, IUserData, NavigationHelperService } from '@sunbird/shared';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TelemetryService } from '@sunbird/telemetry';
import { frameworkList } from '../../../content-search/components/search-data';


@Component({
  selector: 'app-content-type',
  templateUrl: './content-type.component.html',
  styleUrls: ['./content-type.component.scss'],
})
export class ContentTypeComponent implements OnInit, OnDestroy {
  @Output() closeSideMenu = new EventEmitter<any>();
  @Input() layoutConfiguration;
  @Input() showBackButton = false;
  contentTypes;
  selectedContentType;
  isDesktopApp = false;
  exploreNcert: boolean = false;
  public unsubscribe$ = new Subject<void>();
  subscription: any;
  userType: any;
  returnTo: string;
  constructor(
    public formService: FormService,
    public resourceService: ResourceService,
    public router: Router,
    public userService: UserService,
    private telemetryService: TelemetryService,
    public activatedRoute: ActivatedRoute,
    public layoutService: LayoutService,
    private utilService: UtilService,
    public navigationhelperService: NavigationHelperService,
  ) {}


  ngOnInit() {
    this.getContentTypes();
    this.isDesktopApp = this.utilService.isDesktopApp;
    this.layoutService.updateSelectedContentType
      .subscribe((data) => {
        this.updateSelectedContentType(data);
      });

    if (this.router.url.indexOf('/exploren') > -1) {
      this.exploreNcert = true;
    }
  }


  setContentTypeOnUrlChange() {
    combineLatest(this.activatedRoute.queryParams, this.activatedRoute.params)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        this.setSelectedContentType(this.router.url, result[0], result[1]);
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  generateTelemetry(contentType) {
    const interactData = {
      context: {
        env: _.get(this.activatedRoute, 'snapshot.data.telemetry.env') || 'content-type',
        cdata: []
      },
      edata: {
        id: contentType,
        type: 'click',
        pageid: this.router.url || 'content-type'
      }
    };
    this.telemetryService.interact(interactData);
  }

  showContentType(data) {
    this.generateTelemetry(data.contentType);
    let userPreference;
    let params;
    try {
      if (this.userService.loggedIn) {
        userPreference = { framework: this.userService.defaultFrameworkFilters };
        params = _.cloneDeep(_.get(userPreference, 'framework'));
      } else {
        const guestUserDetails = localStorage.getItem('guestUserDetails');
        if (guestUserDetails) {
          userPreference = JSON.parse(guestUserDetails);
          params = _.cloneDeep(_.get(userPreference, 'framework'));
        }
      }
    } catch (error) {
      return null;
    }
    let pathname = this.userService._slug;
    if( pathname && pathname==="dikshacustodian" && this.userService._userProfile.framework.board){
      let board = this.userService._userProfile.framework.board[0];
     //117337 - removed hardcoded cbse/ncert
      // if(board==="CBSE/NCERT"){
      //     board="CBSE";
      // }
      pathname = Object.keys(frameworkList).find(key => frameworkList[key].name === board);
    }
    else if( !pathname && userPreference.framework.board){
      let board = userPreference.framework.board[0];
      //117337 - removed hardcoded cbse/ncert
      // if(board==="CBSE/NCERT"){
      //     board="CBSE";
      // }
      pathname = Object.keys(frameworkList).find(key => frameworkList[key].name === board);
    }
    // All and myDownloads Tab should not carry any filters from other tabs / user can apply fresh filters
    if(this.exploreNcert) {
      params = _.omit(params, ['board', 'medium', 'gradeLevel', 'subject', 'se_boards', 'se_mediums', 'se_gradeLevels', 'se_subjects']);
    } else {
      if (data.contentType === 'mydownloads' || data.contentType === 'all') {
        params = _.omit(params, ['board', 'medium', 'gradeLevel', 'subject', 'se_boards', 'se_mediums', 'se_gradeLevels', 'se_subjects']);
      }
    }
    console.log("User preference in params check after", params)
    console.log("Full data", data);
    if (this.userService.loggedIn) {
      if(pathname && data.contentType === "About") {
        window.open('/'+pathname,'_self');
      } else {
        this.router.navigate([this.exploreNcert ? '/exploren/1' : data.loggedInUserRoute.route],
          { queryParams: { ...params, selectedTab: data.loggedInUserRoute.queryParam } });
      }        
    } else {
      if(pathname && data.contentType === "About") {
        window.open('/'+pathname,'_self');
      } else {
        if(((params.board && params.board[0] && params.board[0] != undefined) && params.board[0] == 'CBSE')){
          //117337 - removed hardcoded cbse/ncert
          // !data.isLoginMandatory ?
          // this.router.navigate([this.exploreNcert ? '/exploren/1' : data.anonumousUserRoute.route],
          //   { queryParams: { ...params,board: 'CBSE/NCERT',selectedTab: data.anonumousUserRoute.queryParam } }) : window.location.href = this.exploreNcert ? '/exploren' : data.loggedInUserRoute.route;
        
          !data.isLoginMandatory ?
          this.router.navigate([this.exploreNcert ? '/exploren/1' : data.anonumousUserRoute.route],
            { queryParams: { ...params,board: 'CBSE',selectedTab: data.anonumousUserRoute.queryParam } }) : window.location.href = this.exploreNcert ? '/exploren' : data.loggedInUserRoute.route;
       
        } else if(((params.board && params.board[0] && params.board[0] != undefined) && params.board[0] == 'ncert')){
          !data.isLoginMandatory ?
          this.router.navigate([this.exploreNcert ? '/exploren/1' : data.anonumousUserRoute.route],
            { queryParams: { ...params,board: 'NCERT',selectedTab: data.anonumousUserRoute.queryParam } }) : window.location.href = this.exploreNcert ? '/exploren' : data.loggedInUserRoute.route;
        } else if(params.board && params.board[0] && params.board[0] != undefined){
          !data.isLoginMandatory ?
          this.router.navigate([this.exploreNcert ? '/exploren/1' : data.anonumousUserRoute.route],
            { queryParams: { ...params,board: params.board[0],selectedTab: data.anonumousUserRoute.queryParam } }) : window.location.href = this.exploreNcert ? '/exploren' : data.loggedInUserRoute.route;
        } else {
          !data.isLoginMandatory ?
          this.router.navigate([this.exploreNcert ? '/exploren/1' : data.anonumousUserRoute.route],
            { queryParams: { ...params,selectedTab: data.anonumousUserRoute.queryParam } }) : window.location.href = this.exploreNcert ? '/exploren' : data.loggedInUserRoute.route;
        }
      }
    }
  }


  setSelectedContentType(url, queryParams, pathParams) {
    if (url.indexOf('play') >= 0) {
      this.selectedContentType = queryParams.contentType ? queryParams.contentType.toLowerCase() : null;
    } else if (url.indexOf('explore-course') >= 0 || url.indexOf('learn') >= 0) {
      this.selectedContentType = queryParams.selectedTab ? queryParams.selectedTab : 'course';
    } else if (url.indexOf('explore-groups') >= 0) {
      this.selectedContentType = null;
    } else if (url.indexOf('resources') >= 0 || url.indexOf('explore') >= 0) {
      this.selectedContentType = queryParams.selectedTab ? queryParams.selectedTab : 'home';
    } else if (url.indexOf('mydownloads') >= 0) {
      this.selectedContentType = queryParams.selectedTab ? queryParams.selectedTab : 'mydownloads';
    } else if (url.indexOf('observation') >= 0) {
      this.selectedContentType = queryParams.selectedTab ? queryParams.selectedTab : 'observation';
    } else {
      this.selectedContentType = queryParams.selectedTab ? queryParams.selectedTab : null;
    }
  }
  updateSelectedContentType(contentType) {
    const ct = this.contentTypes.find((cty: any) => cty.contentType === contentType.toLowerCase());
    if (ct) {
      this.selectedContentType = ct.contentType;
    } else {
      this.selectedContentType = 'all';
    }
  }

  updateForm() {
    if (!this.userType) {
      if (this.userService.loggedIn) {
        this.userService.userData$.pipe(takeUntil(this.unsubscribe$)).subscribe((profileData: IUserData) => {
          if (_.get(profileData, 'userProfile.profileUserType.type')) {
            this.userType = profileData.userProfile['profileUserType']['type'];
          }
          this.makeFormChange();
        });
      } else {
        const user = localStorage.getItem('userType');
        if (user) {
          this.userType = user;
          this.makeFormChange();
        } else {
          this.utilService.currentRole.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
            this.userType = res;
            this.makeFormChange();
          });
        }
      }
    }
  }
  makeFormChange() {
    const index = this.contentTypes.findIndex(cty => cty.contentType === 'observation');
    if (this.userType != 'administrator') {
      this.contentTypes[index].isEnabled = false;
    } else {
      this.contentTypes[index].isEnabled = true;
    }
  }

  processFormData(formData) {
    this.contentTypes = _.sortBy(formData, 'index');
    const defaultTab = _.find(this.contentTypes, ['default', true]);
    this.selectedContentType = this.activatedRoute.snapshot.queryParams.selectedTab || _.get(defaultTab, 'contentType') || 'home';
  }

  getTitle(contentType) {
    return _.get(this.resourceService, _.get(contentType, 'title'));
  }

  getIcon(contentType) {
    return _.get(contentType, 'theme.className');
  }

  getContentTypes() {
    const formServiceInputParams = {
      formType: 'contentcategory',
      formAction: 'menubar',
      contentType: 'global'
    };
    this.formService.getFormConfig(formServiceInputParams).subscribe((data: any) => {
      // to show/hide about tab

      // const pathSegment = this.userService._slug;
      // const targetItem = data.find(item => item.index === 10);
      // targetItem.isEnabled = false;
      // if (pathSegment && frameworkList[pathSegment]?.tenantPageExist) {
      //   targetItem.isEnabled = true;
      // } 

      this.processFormData(data);
      this.updateForm();
      this.setContentTypeOnUrlChange();
    });
  }

  isLayoutAvailable() {
    return this.layoutService.isLayoutAvailable(this.layoutConfiguration);
  }
}
