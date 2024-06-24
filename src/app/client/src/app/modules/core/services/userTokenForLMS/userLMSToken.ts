import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService, LearnerService } from '@sunbird/core';
import { ConfigService, ServerResponse } from '@sunbird/shared';
@Injectable({
    providedIn: 'root'
})
export class userLMSToken {

    private apiUrl = 'https://jenkins.oci.diksha.gov.in/diksha-jwttoken/jwtlmsgenarator';

    constructor(private http: HttpClient,
        public userService: UserService,
        public config: ConfigService,
        public learnerService: LearnerService,
    ) { }



    getToken(payload: any): Promise<any> {
        const { userid, firstname, lastname, emailid, phone } = payload;
        const url = `${this.apiUrl}?userid=${userid}&firstname=${firstname}&lastname=${lastname}&emailid=${emailid}&phone=${phone}`;
        console.log("TOKEN URL....", url)
        return this.http.get<any>(url).toPromise();
    }

    getUserLocationData(ids: string[]): Promise<any> {
        const apiUrl = 'https://diksha.gov.in/api/data/v1/location/search';
        const data = JSON.stringify({
            "request": {
                "filters": {
                    "id": ids,
                },
                "sort_by": {
                    "code": "asc"
                },
                "limit": 1000
            }
        });

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZUJyTmhjY2djNWNzUnh2ZU02Z2JYMWFuVTZxZGZyYiJ9.PggkeMJjWcV4MEy3J5XnizCCd6qcrFSD5y5rron_G9Y'
        });

        return this.http.post(apiUrl, data, { headers }).toPromise();
    }


   
    // LMS part start
    public isUserLoggedIn(): boolean {
        return this.userService && (this.userService.loggedIn || false);
    }
    userData: any;
    lmsData: any;

    /**
      * this is common method to get data form LMS - 
      * it can use for LMS requirement to redirect from DIKSHA to LMS web portal
     */
    getDataForLMS(): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log("getting user id in common method....", this.userService?.userProfile?.userId);
            console.log("isUserLoggedIn in common method", this.isUserLoggedIn());
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
                            this.getUserLocationData(ids)
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
                                    // resolve the promise with userDataObject
                                    console.log("userDataObject....", userDataObject);
                                    resolve(userDataObject);
                                })
                                .catch(error => {
                                    console.error(error);
                                    reject(error);
                                });
                        } else {
                            resolve(null); // or reject(new Error("No ids or user not logged in"));
                        }
                    } else {
                        resolve(null); // or reject(new Error("No user data found"));
                    }
                },
                (err: ServerResponse) => {
                    console.log("getDecriptedUserProfile error ", err);
                    reject(err);
                }
            );
        });
    }
    
     // LMS part end

}
