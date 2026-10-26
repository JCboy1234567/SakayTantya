import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guide.html',
  styleUrl: './guide.css',
})
export class Guide {
  faqs = [
    {
      q: 'How is the fare estimated?',
      a: 'Fares are calculated using official LTFRB base rates plus distance-based tariff increments adjusted live for current fuel commodity prices.'
    },
    {
      q: 'How do I submit bug reports or feedback?',
      a: 'You can report any transit issues or app bugs directly through the admin feedback integration or contact our support line.'
    },
    {
      q: 'Are discounts applicable for students and seniors?',
      a: 'Yes! Authorized 20% discount rules apply for students, senior citizens, and PWDs upon presenting valid IDs to transport operators.'
    }
  ];
}
