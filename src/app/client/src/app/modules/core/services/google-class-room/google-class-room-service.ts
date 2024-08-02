import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { first } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GoogleClassroomService {
    constructor(private http: HttpClient) { }
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

    exchangeCodeForToken(code: string): Promise<any> {
        const clientId = '872658188174-tf46ui5fe852qae790rpjj7jdbnljbi9.apps.googleusercontent.com';
        const clientSecret = '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';
        // const redirectUri = 'http://localhost:4200/google-class-room';
        const redirectUri = 'http://localhost:3000/explore/1?id=ncert_k-12&selectedTab=all';
        const apiUrl = 'https://oauth2.googleapis.com/token';
        const body = new HttpParams()
            .set('code', code)
            .set('client_id', clientId)
            .set('client_secret', clientSecret)
            .set('redirect_uri', redirectUri)
            .set('grant_type', 'authorization_code');
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
        });
        return this.http.post(apiUrl, body, { headers }).toPromise();
    }

    // get course details using do-id 

    async getCourseDetails(doId: string): Promise<any> {
        const url = `http://localhost:3000/api/course/v1/hierarchy/${doId}?orgdetails=orgName,email&licenseDetails=name,description,url`
        try {
            const response = await this.http.get(url).pipe(first()).toPromise();
            return response;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}