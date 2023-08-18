import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingRoomComponent } from './operating-room.component';

describe('OperatingRoomComponent', () => {
  let component: OperatingRoomComponent;
  let fixture: ComponentFixture<OperatingRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatingRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
