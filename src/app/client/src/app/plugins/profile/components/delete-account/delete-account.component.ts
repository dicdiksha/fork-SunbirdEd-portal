import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash-es';
import { UserService, OtpService } from '@sunbird/core';
import { ResourceService, ServerResponse, ToasterService, ConfigService,CacheService } from '@sunbird/shared';
import { Subject } from 'rxjs';
// import { ProfileService } from '../../services';
import { IInteractEventObject, IInteractEventEdata } from '@sunbird/telemetry';
import { MatDialog } from '@angular/material/dialog';
// import { DeviceDetectorService } from 'ngx-device-detector';
import { UserSearchService } from '../../../../modules/search/services/user-search/user-search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LearnerService } from '../../../../modules/core/services/learner/learner.service';
import { map} from 'rxjs/operators';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.scss'],
  providers: [UserSearchService]
})
export class DeleteAccountComponent implements OnInit, OnDestroy {
  public unsubscribe = new Subject<void>();
  @Input() contactType: string;
  @Input() userProfile: any;
  @Output() close = new EventEmitter<any>();
  @Input() dialogProps;
  contactTypeForm: FormGroup;
  enableSubmitBtn = false;
  showUniqueError = '';
  
  otpData: any;
  submitInteractEdata: IInteractEventEdata;
  telemetryInteractObject: IInteractEventObject;
  verifiedUser = false;
  templateId: any = 'otpContactUpdateTemplate';

  constructor(
    public resourceService: ResourceService, 
    public userService: UserService,
    public otpService: OtpService, 
    public toasterService: ToasterService,
    // public profileService: ProfileService, 
    private matDialog: MatDialog,
    public configService: ConfigService,
    // private cacheService:CacheService,
    // public deviceDetectorService: DeviceDetectorService,
    private userSearchService: UserSearchService,
    public route: Router,
    private activatedRoute: ActivatedRoute,
    public learnerService: LearnerService,
  ) { }

  ngOnInit() {
    this.validateAndEditContact();
  }

  private async validateAndEditContact() {
    if (this.userProfile) {
      const request: any = {
        key: this.userProfile.email || this.userProfile.phone || this.userProfile.recoveryEmail,
        userId: this.userProfile.userId,
       // templateId: this.configService.appConfig.OTPTemplate.userDeleteTemplate,
       templateId: 'otpContactUpdateTemplate',
        type: ''
      };
      if ((this.userProfile.email) || this.userProfile.recoveryEmail) {
        request.type = 'email';
      } else if (this.userProfile.phone || this.userProfile.recoveryPhone) {
        request.type = 'phone';
      }
      const otpData = {
        'type': request.type,
        'value': request.key,
        'instructions': request.type === 'phone' ? this.resourceService.frmelmnts.lbl.phoneOtpDeleteInfo : this.resourceService.frmelmnts.lbl.emailOtpDeleteInfo,
        'retryMessage': this.resourceService.frmelmnts.lbl.unableToDeleteAccount,
        'wrongOtpMessage': request.type === 'phone' ? this.resourceService.frmelmnts.lbl.wrongPhoneOTP :
          this.resourceService.frmelmnts.lbl.wrongEmailOTP
      };
      this.verifiedUser = false;
     
     
    //let resultttt =  await this.userService.getDecryptedUserProfile();
     const option = {
      url: `${this.configService.urlConFig.URLS.USER.GET_PROFILE}${this.userProfile.userId}${'?userdelete=true'}`,
      param: this.configService.urlConFig.params.userReadParam
    };
    this.learnerService.getWithHeaders(option).subscribe(
      (data: ServerResponse) => {
        if(data?.result && (data?.result?.response?.phone || data?.result?.response?.email)){
          //user update
          let updateData = {userDeleteCalled:true, userId:this.userProfile.userId};
          if(data?.result?.response?.phone && data?.result?.response?.phone != "")
          {
            updateData['phone'] = data?.result?.response?.phone + '-'+ Date.now()
          } else if(data?.result?.response?.email && data?.result?.response?.email !="")
          {
            updateData['email'] = data?.result?.response?.email.slice(0, data?.result?.response?.email.indexOf('@')) + '-'+Date.now() + data?.result?.response?.email.slice(data?.result?.response?.email.indexOf('@'));
          }
          const options = {
            url: this.configService.urlConFig.URLS.USER.UPDATE_USER_PROFILE,
            data: updateData
          };
            console.log("profile API key",options);
            return this.learnerService.patch(options).pipe(map(
              (res: ServerResponse) => {
                console.log("profile API update result",res);
                return res;
              }
            ));

        }
      },
      (err: ServerResponse) => {
        console.log("getDecriptedUserProfile error ",err);
        // this.toasterService.error(err);
      }
    )


    // this.generateOTP({ request }, otpData);
    }
  }

  closeModal() {
    this.closeMatDialog();
    this.close.emit();
  }

  prepareOtpData(otpData?) {
    this.otpData = otpData || {
      'type': this.contactType.toString(),
      'value': this.contactType === 'phone' ?
        this.contactTypeForm.controls.phone.value.toString() : this.contactTypeForm.controls.email.value,
      'instructions': this.contactType === 'phone' ?
        this.resourceService.frmelmnts.instn.t0083 : this.resourceService.frmelmnts.instn.t0084,
      'retryMessage': this.contactType === 'phone' ?
        this.resourceService.frmelmnts.lbl.unableToUpdateMobile : this.resourceService.frmelmnts.lbl.unableToUpdateEmail,
      'wrongOtpMessage': this.contactType === 'phone' ? this.resourceService.frmelmnts.lbl.wrongPhoneOTP :
        this.resourceService.frmelmnts.lbl.wrongEmailOTP
    };
  }

  generateOTP(request?, otpData?) {
    if (!request) {
      request = {
        'request': {
          'key': this.contactType === 'phone' ?
            this.contactTypeForm.controls.phone.value.toString() : this.contactTypeForm.controls.email.value,
          'type': this.contactType.toString()
        }
      };
    }
    this.prepareOtpData(otpData);

    this.otpService.generateOTP(request).subscribe(
      (data: ServerResponse) => {
        this.prepareOtpData(otpData);
      },
      (err) => {
        const failedgenerateOTPMessage = (err.error.params.status === 'PHONE_ALREADY_IN_USE') ||
          (err.error.params.status === 'EMAIL_IN_USE') ? err.error.params.errmsg : this.resourceService.messages.fmsg.m0051;
        this.toasterService.error(failedgenerateOTPMessage);
        this.enableSubmitBtn = true;
        if (!this.verifiedUser) {
          // this.closeModal();
        }
      }
    );
  }

  verificationSuccess(data) {
    // this.userService.deleteUser().subscribe(
    //   (data: ServerResponse) => {
    //     if(_.get(data, 'result.response') === 'SUCCESS'){
    //       window.location.replace('/logoff');
    //       this.cacheService.removeAll();
    //       if(this.deviceDetectorService.isMobile()){
    //         //TODO changes need to be done on the Mobile Deeplink
    //         const url ='dev.sunbird.app://mobile?userId'+ this.userProfile.userId;
    //         window.open(url, '_blank');
    //       }
    //       window.location.replace('/logoff');
    //       this.cacheService.removeAll();
    //     }
    //   },
    //   (err) => {
    //     //TODO we need to update the error 
    //     const errorMessage =  this.resourceService.messages.fmsg.m0085;
    //     this.toasterService.error(errorMessage);
    //   }
    // );


    const option = { userId: this.userProfile.identifier };
    this.userSearchService.deleteUser(option).subscribe(
      (apiResponse: ServerResponse) => {
        console.log("delete account userSearchService.deleteUser==")
        this.toasterService.success(this.resourceService.messages.smsg.m0029);
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          this.route.navigate(['../../'], {relativeTo: this.activatedRoute});
        }, 500);
        
      },
      err => {
        this.toasterService.error(this.resourceService.messages.emsg.m0005);
      }
    );
  }



  setInteractEventData() {
    const id = 'delete-account';
    this.submitInteractEdata = {
      id: id,
      type: 'click',
      pageid: 'delete-account'
    };

    this.telemetryInteractObject = {
      id: this.userService.userid,
      type: 'User',
      ver: '1.0'
    };
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.closeMatDialog();
  }

  closeMatDialog() {
    const dialogRef = this.dialogProps && this.dialogProps.id && this.matDialog.getDialogById(this.dialogProps.id);
    dialogRef && dialogRef.close();
  }
}