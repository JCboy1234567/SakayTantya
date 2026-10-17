import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Routesestimates } from './routesestimates';

describe('Routesestimates', () => {
  let component: Routesestimates;
  let fixture: ComponentFixture<Routesestimates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Routesestimates],
    }).compileComponents();

    fixture = TestBed.createComponent(Routesestimates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
