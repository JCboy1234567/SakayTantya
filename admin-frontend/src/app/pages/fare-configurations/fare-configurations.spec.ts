import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareConfigurations } from './fare-configurations';

describe('FareConfigurations', () => {
  let component: FareConfigurations;
  let fixture: ComponentFixture<FareConfigurations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareConfigurations],
    }).compileComponents();

    fixture = TestBed.createComponent(FareConfigurations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
