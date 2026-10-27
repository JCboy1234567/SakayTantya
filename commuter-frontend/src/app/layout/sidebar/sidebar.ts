import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideBookOpen, LucideBus, LucideFuel, LucideLogOut, LucideMap, LucideUser } from '@lucide/angular';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideBus,
    LucideMap,
    LucideFuel,
    LucideBookOpen,
    LucideUser,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {}
