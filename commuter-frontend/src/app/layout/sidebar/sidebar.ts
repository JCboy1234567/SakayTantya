import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class Sidebar implements OnInit, OnDestroy {
  isDarkMode = false;

  private readonly themeListener = () => this.syncTheme();

  ngOnInit(): void {
    this.syncTheme();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.themeListener);
      window.addEventListener('themechange', this.themeListener);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.themeListener);
      window.removeEventListener('themechange', this.themeListener);
    }
  }

  private syncTheme(): void {
    if (typeof localStorage !== 'undefined') {
      this.isDarkMode = localStorage.getItem('theme') === 'dark';
    }
  }
}
