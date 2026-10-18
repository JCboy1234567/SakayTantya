import { Component, Input } from '@angular/core';
import { LucideConstruction, LucideArrowLeft } from '@lucide/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-under-work',
  standalone: true,
  imports: [
    LucideConstruction,
    LucideArrowLeft,
    RouterLink,
  ],
  templateUrl: './under-work.html',
})
export class UnderWork {
  @Input() title = 'Feature Under Development';

  @Input() description =
    'We are working hard to bring this feature to you.';
}