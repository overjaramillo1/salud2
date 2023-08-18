import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillbordComponent } from './billbord.component';

describe('BillbordComponent', () => {
  let component: BillbordComponent;
  let fixture: ComponentFixture<BillbordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillbordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillbordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
