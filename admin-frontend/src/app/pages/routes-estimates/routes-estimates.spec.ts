import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutesEstimates } from './routes-estimates';

describe('RoutesEstimates', () => {
  let component: RoutesEstimates;
  let fixture: ComponentFixture<RoutesEstimates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutesEstimates],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutesEstimates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
