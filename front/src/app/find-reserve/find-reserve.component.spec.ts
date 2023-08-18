import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindReserveComponent } from './find-reserve.component';

describe('FindReserveComponent', () => {
  let component: FindReserveComponent;
  let fixture: ComponentFixture<FindReserveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindReserveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindReserveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
