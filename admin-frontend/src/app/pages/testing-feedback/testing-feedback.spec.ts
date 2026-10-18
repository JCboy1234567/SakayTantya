import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingFeedback } from './testing-feedback';

describe('TestingFeedback', () => {
  let component: TestingFeedback;
  let fixture: ComponentFixture<TestingFeedback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingFeedback],
    }).compileComponents();

    fixture = TestBed.createComponent(TestingFeedback);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
