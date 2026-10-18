import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceAvailability } from './service-availability';

describe('ServiceAvailability', () => {
  let component: ServiceAvailability;
  let fixture: ComponentFixture<ServiceAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceAvailability],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceAvailability);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
