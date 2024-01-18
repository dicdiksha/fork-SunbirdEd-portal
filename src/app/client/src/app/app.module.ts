import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { SuiModalModule } from 'ng2-semantic-ui-v9';
import { CommonModule } from '@angular/common';
import { CoreModule, SessionExpiryInterceptor } from '@sunbird/core';
import { SharedModule } from '@sunbird/shared';
import { TelemetryModule } from '@sunbird/telemetry';
import { SharedFeatureModule } from '@sunbird/shared-feature';
import { BootstrapFramework, WebExtensionModule } from '@project-sunbird/web-extensions';
import { WebExtensionsConfig } from './framework.config';
import { CacheService } from 'ng2-cache-service';
import { CacheStorageAbstract } from 'ng2-cache-service/dist/src/services/storage/cache-storage-abstract.service';
import { CacheSessionStorage } from 'ng2-cache-service/dist/src/services/storage/session-storage/cache-session-storage.service';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { PluginModules } from './framework.config';
import {ChatLibModule, ChatLibService} from 'dictrigyn-chatbot-client';
import { RouteReuseStrategy } from '@angular/router';
import { CustomRouteReuseStrategy } from './service/CustomRouteReuseStrategy/CustomRouteReuseStrategy';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateStore } from '@ngx-translate/core';
import { SbSearchFilterModule } from '@dictrigyn/common-form-elements';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AngularFireAnalyticsModule, ScreenTrackingService } from '@angular/fire/analytics';
import { AngularFireModule } from '@angular/fire';

const firebaseConfig = {
  apiKey: "AIzaSyA1rRdz7oyOB7Pf7uKhgfvBacgf8o4inno",
  authDomain: "diksha-4446b.firebaseapp.com",
  databaseURL: "https://diksha-4446b.firebaseio.com",
  projectId: "diksha-4446b",
  storageBucket: "diksha-4446b.appspot.com",
  messagingSenderId: "280944945973",
  appId: "1:280944945973:web:86ba50ffc9e1ec8ab5fa7c",
  measurementId: "G-9Z3LDJ42BE"
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule, // used this instaed of browser module since it includes in it.
    CoreModule,
    CommonModule,
    HttpClientModule,
    ModalModule.forRoot(),
    SuiModalModule,
    SharedModule.forRoot(),
    WebExtensionModule.forRoot(),
    TelemetryModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
    DeviceDetectorModule.forRoot(),
    SbSearchFilterModule.forRoot('web'),
    ChatLibModule,
    SharedFeatureModule,
    ...PluginModules,
     // ngx-translate and the loader module
     HttpClientModule,
    AppRoutingModule, // don't add any module below this because it contains wildcard route
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAnalyticsModule,
  ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    CacheService,
    ChatLibService,
    TranslateStore,
    { provide: CacheStorageAbstract, useClass: CacheSessionStorage },
    { provide: HTTP_INTERCEPTORS, useClass: SessionExpiryInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
    ScreenTrackingService,
    // UserTrackingService
  ]
})
export class AppModule {
  constructor(bootstrapFramework: BootstrapFramework) {
    bootstrapFramework.initialize(WebExtensionsConfig);
  }
}
// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/resourcebundles/v1/readLang/', ' ');
}
