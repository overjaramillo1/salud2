import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListReservesComponent } from './list-reserves.component';

describe('ListReservesComponent', () => {
  let component: ListReservesComponent;
  let fixture: ComponentFixture<ListReservesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListReservesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListReservesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
