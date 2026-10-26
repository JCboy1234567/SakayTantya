import { TestBed } from '@angular/core/testing';

import { RoleGuards } from './role.guards';

describe('RoleGuards', () => {
  let service: RoleGuards;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleGuards);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
