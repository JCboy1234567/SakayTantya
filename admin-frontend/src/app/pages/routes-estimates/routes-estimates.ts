import { Component } from '@angular/core';
import { UnderWork } from '../under-work/under-work';

@Component({
  selector: 'app-routes-estimates',
  standalone: true,
    imports: [UnderWork],
    template: `
      <app-under-work
        title="Vehicles & Efficiency"
        description="Vehicle profiles, fuel types, and fuel efficiency management are currently under development."
      />
    `,
  // templateUrl: './routes-estimates.html',
  // styleUrl: './routes-estimates.css',
})
export class RoutesEstimates {}
