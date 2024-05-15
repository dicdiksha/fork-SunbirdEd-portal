import { Component, EventEmitter, OnInit, Output, ViewChildren } from '@angular/core';
import { ResourceService, ToasterService, NavigationHelperService, LayoutService, IUserData,ServerResponse,RequestParam } from '@sunbird/shared';
import * as _ from 'lodash-es';
import { takeUntil } from 'rxjs/operators';
import { IInteractEventEdata, IImpressionEventInput } from '@sunbird/telemetry';
import { UserService } from '@sunbird/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { UserSearchService } from '../../../../modules/search/services/user-search/user-search.service';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.scss'],
  providers: [UserSearchService]
})
export class DeleteUserComponent implements OnInit {

  @ViewChildren('inputFields') inputFields;
  @Output() close = new EventEmitter();
  enableSubmitBtn = false;
  conditions = [];
  telemetryImpression: IImpressionEventInput;
  submitInteractEdata: IInteractEventEdata;
  submitCancelInteractEdata: IInteractEventEdata;
  layoutConfiguration: any;
  showContactPopup = false
  list = []
  public unsubscribe = new Subject<void>();
  pageId = 'delete-user';
  userProfile: any;

  constructor(public resourceService: ResourceService, public toasterService: ToasterService, public router: Router,
    public userService: UserService,  private userSearchService: UserSearchService,public route: Router,
    private activatedRoute: ActivatedRoute, public navigationhelperService: NavigationHelperService,
    public layoutService: LayoutService) {
    this.userService.userData$.subscribe((user: IUserData) => {
      this.userProfile = user.userProfile;
    })
  }

  ngOnInit() {
    console.log("ngOnInit .userProfile=======",this.userProfile)
    let obj = this.resourceService.frmelmnts.lbl
    this.list = Object.keys(obj)
      .filter(key => key.includes('condition'))
      .map(key => obj[key]);
    this.navigationhelperService.setNavigationUrl();
    this.setTelemetryData();
    this.layoutConfiguration = this.layoutService.initlayoutConfig();
    this.layoutService.switchableLayout().
      pipe(takeUntil(this.unsubscribe)).subscribe(layoutConfig => {
        if (layoutConfig != null) {
          this.layoutConfiguration = layoutConfig.layout;
        }
      });
  }

  goBack() {
    this.navigationhelperService.goBack();
  }

  setTelemetryData() {
    this.telemetryImpression = {
      context: {
        env: this.activatedRoute.snapshot.data.telemetry.env
      },
      edata: {
        type: this.activatedRoute.snapshot.data.telemetry.type,
        pageid: this.pageId,
        subtype: this.activatedRoute.snapshot.data.telemetry.subtype,
        uri: this.router.url,
        duration: this.navigationhelperService.getPageLoadTime()
      }
    };

    this.submitInteractEdata = {
      id: 'submit-delete-user',
      type: 'click',
      pageid: this.pageId
    };

    this.submitCancelInteractEdata = {
      id: 'cancel-delete-user',
      type: 'click',
      pageid: this.pageId
    };
  }

  onCancel() {
    this.navigationhelperService.navigateToLastUrl();
  }

  onSubmitForm(requestParam: RequestParam) {
    if (this.enableSubmitBtn) {
      this.enableSubmitBtn = false;
      this.showContactPopup = false; // true when full functionality will work with otp
      this.conditions = []
      this.inputFields.forEach((element) => {
        element.nativeElement.checked = false;
      });
      console.log("this.userProfile=======",this.userProfile.identifier)
      const option = { 
        headers: requestParam.header,
        userId: this.userProfile.identifier };
        console.log("onSubmitForm option",option)
      this.userSearchService.deleteUser(option).subscribe(
        (apiResponse: ServerResponse) => {
          this.toasterService.success(this.resourceService.messages.smsg.m0029);
        },
        err => {
          this.toasterService.error(this.resourceService.messages.emsg.m0005);
        }
      );


    }else{
      this.toasterService.warning(this.resourceService.messages.imsg.m0092)
    }
  }

  /**
    * This method checks whether the length of comments is greater than zero.
    * If both the validation is passed it enables the submit button
    */
  validateModal() {
    if ((this.inputFields && this.inputFields.length === this.conditions.length)) {
      this.enableSubmitBtn = true;
    } else {
      this.enableSubmitBtn = false;
    }
  }

  /**
   * This method pushes all the checked conditions into an array
   */
  createCheckedArray(checkedItem) {
    if (checkedItem && (_.indexOf(this.conditions, checkedItem) === -1)) {
      this.conditions.push(checkedItem);
    } else if (checkedItem && (_.indexOf(this.conditions, checkedItem) !== -1)) {
      this.conditions.splice(_.indexOf(this.conditions, checkedItem), 1);
    }
    this.validateModal();
  }

  /**
   * This method helps to redirect to the parent component
   * page, i.e, outbox listing page with proper page number
	 *
	 */
  // redirect(): void {
  //   this.route.navigate(['../../'], {relativeTo: this.activatedRoute});
  // }


}