import { TestBed, inject } from '@angular/core/testing';

import { NasfaService } from './nasfa.service';

describe('NasfaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NasfaService]
    });
  });

  it('should be created', inject([NasfaService], (service: NasfaService) => {
    expect(service).toBeTruthy();
  }));
});
