import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideLayoutDashboard,
  LucideMap,
  LucideSlidersHorizontal,
  LucideFuel,
  LucideBike,
  LucideMessageSquare,
  LucideSettings,
} from '@lucide/angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideMap,
    LucideSlidersHorizontal,
    LucideFuel,
    LucideBike,
    LucideMessageSquare,
    LucideSettings,
  ],
  templateUrl: './sidebar.html',
})
export class Sidebar {}
