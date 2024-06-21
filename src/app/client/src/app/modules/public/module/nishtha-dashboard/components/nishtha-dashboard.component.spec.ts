import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NishthaDashboardComponent } from './nishtha-dashboard.component';

describe('NishthaDashboardComponent', () => {
  let component: NishthaDashboardComponent;
  let fixture: ComponentFixture<NishthaDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NishthaDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NishthaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
