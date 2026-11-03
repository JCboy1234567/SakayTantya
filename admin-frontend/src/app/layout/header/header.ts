import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideMenu,
  LucideBell,
  LucideChevronDown,
  LucideSettings,
  LucideLogOut,
  LucideShieldAlert,
  LucideMessageSquare,
  LucideClock,
  LucideShieldCheck
} from '@lucide/angular';
import { FareService } from '../../core/services/fare.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

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
    LucideShieldAlert,
    LucideMessageSquare,
    LucideClock,
    LucideShieldCheck
  ],
  templateUrl: './header.html',
})
export class Header implements OnInit, OnDestroy {
  today = new Date();
  userName = 'Admin';
  userInitial = 'A';
  showLogoutModal = false;
  isLoggingOut = false;
  showLogoutSuccessModal = false;

  recentFeedbacks: any[] = [];
  unreadCount = 0;
  private previousUnreadCount = 0;
  private isFirstLoad = true;
  private pollSub?: Subscription;
  private soundInterval?: any;
  private audioCtx?: AudioContext;

  constructor(private router: Router, private fareService: FareService, private cdr: ChangeDetectorRef) {}

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

    // Real-time polling every 5 seconds so notifications appear instantly without refreshing
    this.pollSub = interval(5000).pipe(
      startWith(0),
      switchMap(() => this.fareService.getTestingFeedback())
    ).subscribe({
      next: (res: any) => {
        const list = res.data || res || [];
        const pending = list.filter((item: any) => !item.status || item.status === 'Pending Review');
        this.unreadCount = pending.length;
        this.recentFeedbacks = pending.slice(0, 5);

        if (!this.isFirstLoad && this.unreadCount > this.previousUnreadCount) {
          this.startBellLoop();
        } else if (this.unreadCount === 0) {
          this.stopBellLoop();
        }

        this.previousUnreadCount = this.unreadCount;
        this.isFirstLoad = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to poll feedback notifications', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
    this.stopBellLoop();
  }

  private startBellLoop(): void {
    if (this.soundInterval) {
      return; // Already looping
    }
    this.playBellTone();
    this.soundInterval = setInterval(() => {
      this.playBellTone();
    }, 1500); // Rings every 1.5 seconds
  }

  private stopBellLoop(): void {
    if (this.soundInterval) {
      clearInterval(this.soundInterval);
      this.soundInterval = null;
    }
  }

  private playBellTone(): void {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('AudioContext failed to play notification sound', e);
    }
  }

  onNotificationClick(item: any): void {
    if (!item.status || item.status === 'Pending Review') {
      this.fareService.updateTestingFeedback(item.id, {
        tester_name: item.tester_name,
        email: item.email,
        module_tested: item.module_tested,
        vehicle_plate: item.vehicle_plate,
        rating: item.rating,
        feedback_comments: item.feedback_comments,
        status: 'In Progress'
      }).subscribe({
        next: () => {
          // Immediately reload notifications after update
          this.fareService.getTestingFeedback().subscribe((res: any) => {
            const list = res.data || res || [];
            const pending = list.filter((i: any) => !i.status || i.status === 'Pending Review');
            this.unreadCount = pending.length;
            this.recentFeedbacks = pending.slice(0, 5);
            
            if (this.unreadCount === 0) {
              this.stopBellLoop();
            }
            
            this.cdr.detectChanges();
          });
          this.router.navigate(['/testing-feedback']);
        },
        error: (err) => {
          console.error('Failed to update status', err);
          this.router.navigate(['/testing-feedback']);
        }
      });
    } else {
      this.router.navigate(['/testing-feedback']);
    }
  }

  markAllAsRead(): void {
    this.recentFeedbacks.forEach(item => {
      if (!item.status || item.status === 'Pending Review') {
        this.fareService.updateTestingFeedback(item.id, {
          tester_name: item.tester_name,
          email: item.email,
          module_tested: item.module_tested,
          vehicle_plate: item.vehicle_plate,
          rating: item.rating,
          feedback_comments: item.feedback_comments,
          status: 'In Progress'
        }).subscribe({
          next: () => {
            this.fareService.getTestingFeedback().subscribe((res: any) => {
              const list = res.data || res || [];
              const pending = list.filter((i: any) => !i.status || i.status === 'Pending Review');
              this.unreadCount = pending.length;
              this.recentFeedbacks = pending.slice(0, 5);
              if (this.unreadCount === 0) {
                this.stopBellLoop();
              }
              this.cdr.detectChanges();
            });
          },
          error: (e) => console.error('Failed to update status', e)
        });
      }
    });
    this.unreadCount = 0;
    this.recentFeedbacks = [];
    this.stopBellLoop();
    this.cdr.detectChanges();
    this.router.navigate(['/testing-feedback']);
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    this.isLoggingOut = true;
    this.showLogoutModal = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.isLoggingOut = false;
      this.showLogoutSuccessModal = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }, 1500);
    }, 400);
  }
}
