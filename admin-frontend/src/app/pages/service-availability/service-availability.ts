import { Component } from '@angular/core';
import { UnderWork } from '../under-work/under-work';

@Component({
  selector: 'app-service-availability',
  standalone: true,
    imports: [UnderWork],
    template: `
      <app-under-work
        title="Vehicles & Efficiency"
        description="Vehicle profiles, fuel types, and fuel efficiency management are currently under development."
      />
    `,
  // templateUrl: './service-availability.html',
  // styleUrl: './service-availability.css',
})
export class ServiceAvailability {}
