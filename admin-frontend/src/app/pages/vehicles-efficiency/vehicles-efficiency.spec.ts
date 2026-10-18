import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclesEfficiency } from './vehicles-efficiency';

describe('VehiclesEfficiency', () => {
  let component: VehiclesEfficiency;
  let fixture: ComponentFixture<VehiclesEfficiency>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclesEfficiency],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiclesEfficiency);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
