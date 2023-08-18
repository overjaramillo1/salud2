import { TestBed, inject } from '@angular/core/testing';

import { SaludFemeninaService } from './saludFemenina.service';

describe('SaludFemeninaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SaludFemeninaService]
    });
  });

  it('should be created', inject([SaludFemeninaService], (service: SaludFemeninaService) => {
    expect(service).toBeTruthy();
  }));
});
