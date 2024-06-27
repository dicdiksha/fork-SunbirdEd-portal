import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatWithBooksComponent } from './components/chat-with-books.component';

const routes: Routes = [
  {
    path: '', component: ChatWithBooksComponent, data: {
      routeReuse: {
        reuse: true,
        path: 'chatwithbooks'
      },
      menuBar: {
        visible: false
    },
      telemetry: {
        env: 'chatwithbooks', pageid: 'chat-with-books', type: 'view', subtype: 'paginate'
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatWithBooksRoutingModule { }
