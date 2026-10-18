import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderWork } from './under-work';

describe('UnderWork', () => {
  let component: UnderWork;
  let fixture: ComponentFixture<UnderWork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderWork],
    }).compileComponents();

    fixture = TestBed.createComponent(UnderWork);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
