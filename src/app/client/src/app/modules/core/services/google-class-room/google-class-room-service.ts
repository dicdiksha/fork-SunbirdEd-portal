import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class GoogleClassroomService {
    constructor(private http: HttpClient) { }

    private clientId = '872658188174-tf46ui5fe852qae790rpjj7jdbnljbi9.apps.googleusercontent.com';
    private clientSecret = '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';
    private redirectUri = 'http://localhost:4200/google-class-room';

    // Service start
    createCourse(accessToken: string, course: any): Promise<any> {
        const apiUrl = 'https://classroom.googleapis.com/v1/courses';
        const data = JSON.stringify(course);

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        });
        return this.http.post(apiUrl, data, { headers }).toPromise();
    }

    addCourseWorkMaterial(accessToken: string, courseId: string, material: any) {
        const apiUrl = `https://classroom.googleapis.com/v1/courses/${courseId}/courseWorkMaterials`;
        const data = JSON.stringify(material);
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        });
        return this.http.post(apiUrl, data, { headers }).toPromise();
    }

    // Service end

    // // Component start
    // exchangeCodeForToken(code: string) {
    //     const url = 'https://oauth2.googleapis.com/token';
    //     const body = new HttpParams()
    //       .set('code', code)
    //       .set('client_id', this.clientId)
    //       .set('client_secret', this.clientSecret)
    //       .set('redirect_uri', this.redirectUri)
    //       .set('grant_type', 'authorization_code');
    
    //     this.http.post(url, body.toString(), {
    //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    //     }).subscribe((response: any) => {
    //       const accessToken = response.access_token;
    //       console.log('Access Token:', accessToken);
    //       this.token = accessToken;
    //       return accessToken;
    //       // Save the token and use it to create courses
    //       // this.router.navigate(['/google-class-room']);
    //     }, error => {
    //       console.error('Error exchanging code for token:', error);
    //     });
    //   }

}