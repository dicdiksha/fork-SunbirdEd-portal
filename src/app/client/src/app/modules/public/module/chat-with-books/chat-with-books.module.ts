import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWithBooksRoutingModule } from './chat-with-books-routing.module';
import { ChatWithBooksComponent } from './components/chat-with-books.component';


@NgModule({
  declarations: [
    ChatWithBooksComponent
  ],
  imports: [
    CommonModule,
    ChatWithBooksRoutingModule
  ]
})
export class ChatWithBooksModule { }
