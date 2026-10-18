import { Component } from '@angular/core';
import { UnderWork } from '../under-work/under-work';

@Component({
  selector: 'app-vehicles-efficiency',
  standalone: true,
  imports: [UnderWork],
  template: `
    <app-under-work
      title="Vehicles & Efficiency"
      description="Vehicle profiles, fuel types, and fuel efficiency management are currently under development."
    />
  `,
  // templateUrl: './vehicles-efficiency.html',
  // styleUrl: './vehicles-efficiency.css',
})
export class VehiclesEfficiency {}
