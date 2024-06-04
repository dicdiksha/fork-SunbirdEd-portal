import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class userLMSToken {

    private apiUrl = 'https://jenkins.oci.diksha.gov.in/diksha-jwttoken/jwtlmsgenarator';

    constructor(private http: HttpClient) { }

    getToken(payload: any): Promise<any> {
        const { userid, firstname, lastname, emailid, phone } = payload;
        const url = `${this.apiUrl}?userid=${userid}&firstname=${firstname}&lastname=${lastname}&emailid=${emailid}&phone=${phone}`;
        console.log("TOKEN URL....", url)
        return this.http.get<any>(url).toPromise();
    }
}
