import { Component } from '@angular/core';
import { UnderWork } from '../under-work/under-work';

@Component({
  selector: 'app-fuelprice-reference',
  standalone: true,
    imports: [UnderWork],
    template: `
      <app-under-work
        title="Vehicles & Efficiency"
        description="Vehicle profiles, fuel types, and fuel efficiency management are currently under development."
      />
    `,
  // templateUrl: './fuelprice-reference.html',
  // styleUrl: './fuelprice-reference.css',
})
export class FuelpriceReference {}
