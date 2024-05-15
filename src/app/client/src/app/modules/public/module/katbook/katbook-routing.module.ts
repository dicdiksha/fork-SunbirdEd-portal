import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KatbookComponent } from './components/katbook.component';
const routes: Routes = [
  {
    path: '', component: KatbookComponent, data: {
      routeReuse: {
        reuse: true,
        path: 'katbook'
      },
      menuBar: {
        visible: false
    },
      telemetry: {
        env: 'katbook', pageid: 'katbook', type: 'view', subtype: 'paginate'
      }
    }
  }
  ];
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class KatbookRoutingModule { }