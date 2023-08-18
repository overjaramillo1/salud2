import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndTransactionComponent } from './end-transaction.component';

describe('EndTransactionComponent', () => {
  let component: EndTransactionComponent;
  let fixture: ComponentFixture<EndTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
