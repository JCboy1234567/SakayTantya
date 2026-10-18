import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelpriceReference } from './fuelprice-reference';

describe('FuelpriceReference', () => {
  let component: FuelpriceReference;
  let fixture: ComponentFixture<FuelpriceReference>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuelpriceReference],
    }).compileComponents();

    fixture = TestBed.createComponent(FuelpriceReference);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
