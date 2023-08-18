import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckinHealthComponent } from './checkin-health.component';

describe('CheckinHealthComponent', () => {
  let component: CheckinHealthComponent;
  let fixture: ComponentFixture<CheckinHealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckinHealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckinHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
