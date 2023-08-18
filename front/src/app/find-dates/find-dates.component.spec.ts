import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindDatesComponent } from './find-dates.component';

describe('FindDatesComponent', () => {
  let component: FindDatesComponent;
  let fixture: ComponentFixture<FindDatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindDatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
