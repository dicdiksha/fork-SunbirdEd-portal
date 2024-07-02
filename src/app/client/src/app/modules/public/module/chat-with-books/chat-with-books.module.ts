import { SlickModule } from 'ngx-slick';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryModule } from '@sunbird/telemetry';
import { CoreModule } from '@sunbird/core';
import { SharedModule } from '@sunbird/shared';
import { NgInviewModule } from 'angular-inport';
import {SharedFeatureModule} from '@sunbird/shared-feature';
import { SuiSelectModule, SuiModalModule, SuiAccordionModule, SuiPopupModule, SuiDropdownModule, SuiProgressModule,
  SuiRatingModule, SuiCollapseModule, SuiDimmerModule } from 'ng2-semantic-ui-v9';
import { WebExtensionModule } from '@project-sunbird/web-extensions';
import { CommonConsumptionModule } from '@dicdikshaorg/common-consumption';
import { ContentSearchModule } from '@sunbird/content-search';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatWithBooksRoutingModule } from './chat-with-books-routing.module';
import { ChatWithBooksComponent } from './components/chat-with-books.component';


@NgModule({
  declarations: [
    ChatWithBooksComponent
  ],
  imports: [
    CommonModule,
    ChatWithBooksRoutingModule,
    CommonModule,
    TelemetryModule,
    CoreModule,
    SharedModule,
    NgInviewModule,
    SharedFeatureModule,
    FormsModule,
    ReactiveFormsModule,
    SuiSelectModule, SuiModalModule, SuiAccordionModule, SuiPopupModule, SuiDropdownModule, SuiProgressModule,
    SuiRatingModule, SuiCollapseModule, SuiDimmerModule, WebExtensionModule,
    CommonConsumptionModule, ContentSearchModule, SlickModule
  ]
})
export class ChatWithBooksModule { 
  constructor(){
  }
}
