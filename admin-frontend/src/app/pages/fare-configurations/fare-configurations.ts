import { Component } from '@angular/core';
import { UnderWork } from '../under-work/under-work';

@Component({
  selector: 'app-fare-configurations',
  standalone: true,
    imports: [UnderWork],
    template: `
      <app-under-work
        title="Vehicles & Efficiency"
        description="Vehicle profiles, fuel types, and fuel efficiency management are currently under development."
      />
    `,
  // templateUrl: './fare-configurations.html',
  // styleUrl: './fare-configurations.css',
})
export class FareConfigurations {}
