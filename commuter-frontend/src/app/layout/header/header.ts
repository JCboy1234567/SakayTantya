import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { LucideLogOut, LucideBookOpen, LucideSignpost } from '@lucide/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    LucideLogOut,
    LucideBookOpen,
    LucideSignpost,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  showLogoutModal = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  openLogoutModal(event: Event): void {
    event.preventDefault();
    this.showLogoutModal = true;
    this.cdr.detectChanges();
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
    this.cdr.detectChanges();
  }

  consultLogout(): void {}

  confirmLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.showLogoutModal = false;
    this.cdr.detectChanges();
    this.router.navigate(['/login-user']);
  }
}
