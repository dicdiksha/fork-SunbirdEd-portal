import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NishthaDashboardComponent } from './components/nishtha-dashboard.component';
const routes: Routes = [
  {
    path: '', component: NishthaDashboardComponent, data: {
      routeReuse: {
        reuse: true,
        path: 'nishtha'
      },
      menuBar: {
        visible: false
    },
      telemetry: {
        env: 'nishtha', pageid: 'nishtha-dashboard', type: 'view', subtype: 'paginate'
      }
    }
  }
  ];
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class NishthaDashboardRoutingModule { }