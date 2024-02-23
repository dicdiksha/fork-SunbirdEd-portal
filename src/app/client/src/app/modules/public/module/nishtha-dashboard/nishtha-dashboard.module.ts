import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NishthaDashboardComponent } from './components/nishtha-dashboard.component';
import { TelemetryModule } from '@sunbird/telemetry';
import { CoreModule } from '@sunbird/core';
import { SharedModule } from '@sunbird/shared';
import { CommonConsumptionModule } from '@dicdikshaorg/common-consumption';
import { CommonFormElementsModule } from '@dicdikshaorg/common-form-elements';
import { NishthaDashboardRoutingModule } from './nishtha-dashboard-routing.module';

@NgModule({
  declarations: [NishthaDashboardComponent],
  imports: [
    CommonModule,
    TelemetryModule,
    CoreModule,
    SharedModule,
    CommonConsumptionModule,
    CommonFormElementsModule,
    NishthaDashboardRoutingModule
  ],
  exports: [NishthaDashboardComponent]
})
export class NishthaDashboardModule { }
