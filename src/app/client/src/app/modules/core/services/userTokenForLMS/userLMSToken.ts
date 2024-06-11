import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class userLMSToken {

    private apiUrl = 'https://jenkins.oci.diksha.gov.in/diksha-jwttoken/jwtlmsgenarator';
    private uerLocationUrl = 'https://dev.oci.diksha.gov.in/learner/user/v5/read/2f47892e-0de1-409e-8b05-4f5d9db18278?userdelete=true&fields=organisations,roles,locations,declarations,externalIds';


    constructor(private http: HttpClient) { }

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

}
