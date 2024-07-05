import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWithBooksComponent } from './chat-with-books.component';

describe('ChatWithBooksComponent', () => {
  let component: ChatWithBooksComponent;
  let fixture: ComponentFixture<ChatWithBooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatWithBooksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatWithBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
