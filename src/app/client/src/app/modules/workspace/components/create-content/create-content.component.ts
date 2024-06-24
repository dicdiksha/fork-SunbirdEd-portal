import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ResourceService, ConfigService, NavigationHelperService, ServerResponse } from '@sunbird/shared';
import { FrameworkService, PermissionService, UserService } from '@sunbird/core';
import { IImpressionEventInput } from '@sunbird/telemetry';
import { WorkSpaceService } from './../../services';
import { LearnerService } from '@sunbird/core';
import {
  userLMSToken
 } from '../../../core/services/userTokenForLMS/userLMSToken';
@Component({
  selector: 'app-create-content',
  templateUrl: './create-content.component.html'
})
export class CreateContentComponent implements OnInit, AfterViewInit {

  /*
 roles allowed to create textBookRole
 */
  textBookRole: Array<string>;
  /**
    * lessonRole   access roles
  */
  lessonRole: Array<string>;
  /**
 * collectionRole  access roles
 */
  collectionRole: Array<string>;
  /**
  *  lessonplanRole access roles
  */
  lessonplanRole: Array<string>;
  /**
  *  lessonplanRole access roles
  */
  contentUploadRole: Array<string>;
  /**
   * courseRole  access roles
  */
  courseRole: Array<string>;
 /**
   * assesment access role
   */
  assessmentRole: Array<string>;
  /**
   * upForReviewRole access role
   */
  upForReviewRole: Array<string>;

  /**
   * To call resource service which helps to use language constant
   */
  public resourceService: ResourceService;
  /**
   * Reference for framework service
  */
  public frameworkService: FrameworkService;

  /**
   * reference of permissionService service.
  */
  public permissionService: PermissionService;
  /**
  * reference of config service.
 */
  public configService: ConfigService;
  /**
	 * telemetryImpression
	*/
  telemetryImpression: IImpressionEventInput;
  public enableQuestionSetCreation;
  /**
  * Constructor to create injected service(s) object
  *
  * Default method of DeleteComponent class

  * @param {ResourceService} resourceService Reference of ResourceService
 */

  userProfile: any;
  userData:any;

  public isUserLoggedIn(): boolean {
    return this.userService && (this.userService.loggedIn || false);
  }

  constructor(configService: ConfigService, resourceService: ResourceService,
    frameworkService: FrameworkService, permissionService: PermissionService,
    private activatedRoute: ActivatedRoute, public userService: UserService,
    public navigationhelperService: NavigationHelperService,
    public workSpaceService: WorkSpaceService,
    public config: ConfigService,
    public learnerService: LearnerService,
    private userLMSToken: userLMSToken,
  ) {
    this.resourceService = resourceService;
    this.frameworkService = frameworkService;
    this.permissionService = permissionService;
    this.configService = configService;
  }

  ngOnInit() {
    this.frameworkService.initialize();
    this.textBookRole = this.configService.rolesConfig.workSpaceRole.textBookRole;
    this.lessonRole = this.configService.rolesConfig.workSpaceRole.lessonRole;
    this.collectionRole = this.configService.rolesConfig.workSpaceRole.collectionRole;
    this.lessonplanRole = this.configService.rolesConfig.workSpaceRole.lessonplanRole;
    this.contentUploadRole = this.configService.rolesConfig.workSpaceRole.contentUploadRole;
    this.assessmentRole = this.configService.rolesConfig.workSpaceRole.assessmentRole;
    this.upForReviewRole = this.configService.rolesConfig.workSpaceRole.upForReviewRole;
    this.courseRole = this.configService.rolesConfig.workSpaceRole.courseRole;
    this.workSpaceService.questionSetEnabled$.subscribe(
      (response: any) => {
        this.enableQuestionSetCreation = response.questionSetEnablement;
      }
    );
  }



  ngAfterViewInit () {
    setTimeout(() => {
      this.telemetryImpression = {
        context: {
          env: this.activatedRoute.snapshot.data.telemetry.env
        },
        edata: {
          type: this.activatedRoute.snapshot.data.telemetry.type,
          pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
          uri: this.activatedRoute.snapshot.data.telemetry.uri,
          duration: this.navigationhelperService.getPageLoadTime()
        }
      };
    });
  }


  navigateToLMSWeb() {
    
    console.log("getting user id....", this.userService?.userProfile?.userId);
    console.log("isUserLoggedIn", this.isUserLoggedIn());
    const optionData = {
        url: `${this.config.urlConFig.URLS.USER.GET_PROFILE}${this.userService?.userProfile?.userId}${'?userdelete=true'}`, // userdelete is not actual deleted user data this is basically unmaksed phone no. & email id and give us reponse
        //   param: this.config.urlConFig.params.userReadParam
    };

    this.learnerService.getWithHeaders(optionData).subscribe(
        (data: ServerResponse) => {
            if (data?.result && (data?.result?.response?.phone || data?.result?.response?.email)) {

                console.log("user data.....", data?.result?.response);
                let ids = []; // locations ids -> state, district,block , cluster, school

                data?.result?.response?.profileLocation?.forEach((element: any) => {
                    ids.push(element?.id)
                });

                console.log("IDS.......", ids);

                if (ids?.length && this.isUserLoggedIn()) {
                    this.userLMSToken.getUserLocationData(ids)
                        .then(locationData => {
                            console.log("locationData?.result?.response", locationData?.result?.response)
                            this.userData = locationData;
                            console.log("this?.userData", this.userData);

                            const createLocationObject = (locations: any) => {
                                return locations?.reduce((acc: any, location: any) => {
                                    acc[location.type] = location.name;
                                    if (location.type === 'school') {
                                        acc.code = location.code;
                                    }
                                    return acc;
                                }, {});
                            };

                            const locationObject = createLocationObject(this?.userData?.result?.response);
                            console.log("locationObject", locationObject);

                            const userDataObject = {
                                firstname: data?.result?.response?.firstName,
                                lastname: data?.result?.response?.lastName,
                                emailid: data?.result?.response?.email,
                                phone: data?.result?.response?.phone,
                                userid: data?.result?.response?.userId,
                                profileUserType: data?.result?.response?.profileUserType?.type,
                                profileUserSubType: data?.result?.response?.profileUserSubType?.subType,
                                rootOrgName: data?.result?.response?.rootOrg?.description,
                                board: data?.result?.response?.framework?.board[0] ? data?.result?.response?.framework?.board[0] : null,
                                ...locationObject, // keys name {state, district, block, cluster, school, code}
                            }

                            console.log("final object", userDataObject);
                            const apiUrl = 'https://jenkins.oci.diksha.gov.in/diksha-jwttoken/jwtlmsgenarator';
                            const url = `${apiUrl}?userid=${userDataObject?.userid}&firstname=${userDataObject?.firstname}&lastname=${userDataObject?.lastname}&emailid=${userDataObject?.emailid}&phone=${userDataObject?.phone}&profileUserType=${userDataObject?.profileUserType}&board=${userDataObject?.board}&state=${userDataObject?.state}&district=${userDataObject?.district}&block=${userDataObject?.block}&cluster=${userDataObject?.cluster}&school=${userDataObject?.school}&code=${userDataObject?.code}&rootOrgName=${userDataObject?.rootOrgName}&profileUserSubType=${userDataObject?.profileUserSubType}`;
                            // window.location.href = url; // open in same tab
                            window.open(url, '_blank'); // open in new tab
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }

            }
        },
        (err: ServerResponse) => {
            console.log("getDecriptedUserProfile error ", err);
        }
    )
}

}
