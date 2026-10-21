import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideMenu,
  LucideBell,
  LucideChevronDown,
  LucideSettings,
  LucideLogOut,
} from '@lucide/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    LucideMenu,
    LucideBell,
    LucideChevronDown,
    LucideSettings,
    LucideLogOut,
  ],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  today = new Date();
  userName = 'Admin';
  userInitial = 'A';
  showLogoutModal = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.name) {
          this.userName = user.name;
          this.userInitial = user.name.charAt(0).toUpperCase();
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
