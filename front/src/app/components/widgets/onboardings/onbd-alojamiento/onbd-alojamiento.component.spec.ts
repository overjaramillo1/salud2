import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnbdAlojamientoComponent } from './onbd-alojamiento.component';

describe('OnbdAlojamientoComponent', () => {
  let component: OnbdAlojamientoComponent;
  let fixture: ComponentFixture<OnbdAlojamientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnbdAlojamientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnbdAlojamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
