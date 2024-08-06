import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryModule } from '@sunbird/telemetry';
import { CoreModule } from '@sunbird/core';
import { SharedModule } from '@sunbird/shared';
import { SharedFeatureModule } from '@sunbird/shared-feature';
import { WebExtensionModule } from '@project-sunbird/web-extensions';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatWithBooksRoutingModule } from './chat-with-books-routing.module';
import { ChatWithBooksComponent } from './components/chat-with-books.component';
import { ClipboardModule } from '@angular/cdk/clipboard'

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
    SharedFeatureModule,
    FormsModule,
    ReactiveFormsModule,
    WebExtensionModule,
    ClipboardModule
  ]
})
export class ChatWithBooksModule { 
  constructor(){
  }
}
