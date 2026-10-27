import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Header,
    Sidebar
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  isDarkMode = false;

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';

    // Listen for storage or custom events if theme changes across components
    window.addEventListener('storage', () => {
      const theme = localStorage.getItem('theme');
      this.isDarkMode = theme === 'dark';
    });
  }

  checkTheme() {
    const theme = localStorage.getItem('theme');
    return theme === 'dark';
  }
}
