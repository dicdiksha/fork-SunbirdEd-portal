import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KatbookRoutingModule } from './katbook-routing.module';
import { KatbookComponent } from './components/katbook.component';
import { TelemetryModule } from '@sunbird/telemetry';
import { CoreModule } from '@sunbird/core';
import { SharedModule } from '@sunbird/shared';
import { CommonConsumptionModule } from '@dicdikshaorg/common-consumption';
import { CommonFormElementsModule } from '@dicdikshaorg/common-form-elements';


@NgModule({
  declarations: [KatbookComponent],
  imports: [
    CommonModule,
    CommonModule,
    TelemetryModule,
    CoreModule,
    SharedModule,
    CommonConsumptionModule,
    CommonFormElementsModule,
    KatbookRoutingModule
  ]
})
export class KatbookModule { }
