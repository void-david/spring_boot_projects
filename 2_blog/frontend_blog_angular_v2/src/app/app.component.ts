import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, FormsModule],
  template: `
    <nav class="nav">
      <div class="nav-inner">
        <a routerLink="/posts" class="nav-logo">
          <span class="logo-mark">◆</span>
          <span class="logo-text">LUMEN</span>
        </a>

        <div class="nav-search">
          <span class="search-icon">⌕</span>
          <input class="search-input" type="text" placeholder="Search posts…"
                 [(ngModel)]="searchQuery" (keydown.enter)="search()" />
        </div>

        <div class="nav-links">
          <a routerLink="/posts" routerLinkActive="nav-link--active"
             [routerLinkActiveOptions]="{exact: false}" class="nav-link">Stories</a>
          <a routerLink="/categories" routerLinkActive="nav-link--active" class="nav-link">Topics</a>
        </div>

        <div class="nav-right">
          @if (auth.isLoggedIn()) {
            @if (auth.isAdmin()) {
              <a routerLink="/posts/new" class="nav-cta">Write →</a>
            }
            <div class="nav-user" (click)="toggleUserMenu()" [class.open]="userMenuOpen()">
              <div class="user-avatar">
                {{ auth.currentUser()?.displayName?.charAt(0)?.toUpperCase() }}
              </div>
              @if (userMenuOpen()) {
                <div class="user-menu">
                  <p class="user-menu-name">{{ auth.currentUser()?.displayName }}</p>
                  <p class="user-menu-email">{{ auth.currentUser()?.email }}</p>
                  <hr class="user-menu-divider" />
                  <button class="user-menu-item" (click)="logout()">Sign out</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="nav-link">Sign in</a>
            <a routerLink="/register" class="nav-cta">Join →</a>
          }
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="nav-logo">
            <span class="logo-mark">◆</span>
            <span class="logo-text">LUMEN</span>
          </div>
          <p class="footer-tagline">Stories worth reading.</p>
        </div>
        <div class="footer-newsletter">
          <p class="footer-nl-label">Get new posts in your inbox</p>
          <div class="footer-nl-form">
            <input type="email" placeholder="your@email.com" class="footer-nl-input"
                   [(ngModel)]="nlEmail" />
            <button class="footer-nl-btn" (click)="subscribe()">Subscribe</button>
          </div>
          @if (nlMsg()) {
            <p class="footer-nl-msg">{{ nlMsg() }}</p>
          }
        </div>
        <p class="footer-copy">© {{ year }} LUMEN. Built with Spring Boot &amp; Angular.</p>
      </div>
    </footer>

    <app-toast />
  `,
  styles: [`
    .nav {
      position: sticky; top: 0; z-index: 1000;
      background: rgba(7, 7, 16, 0.75);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .nav-inner {
      max-width: 1200px; margin: 0 auto; padding: 0 2rem;
      height: 62px; display: flex; align-items: center; gap: 1.25rem;
    }
    .nav-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; flex-shrink: 0; }
    .logo-mark {
      font-size: 1rem;
      background: linear-gradient(135deg, #7C3AED, #DC40C8);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .logo-text { font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.1em; color: #F2F2FF; }
    .nav-search {
      flex: 1; max-width: 320px;
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 999px; padding: 0.35rem 0.85rem;
      transition: border-color 0.15s;
    }
    .nav-search:focus-within { border-color: rgba(124,58,237,0.4); }
    .search-icon { color: #555577; font-size: 1.05rem; flex-shrink: 0; }
    .search-input {
      flex: 1; background: none; border: none; outline: none;
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: #F2F2FF;
    }
    .search-input::placeholder { color: #555577; }
    .nav-links { display: flex; gap: 0.25rem; }
    .nav-link {
      font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #8888AA;
      text-decoration: none; padding: 0.4rem 0.875rem; border-radius: 999px;
      transition: color 0.15s, background 0.15s;
    }
    .nav-link:hover { color: #F2F2FF; background: rgba(255,255,255,0.05); }
    .nav-link--active { color: #F2F2FF; background: rgba(255,255,255,0.06); }
    .nav-right { display: flex; align-items: center; gap: 0.75rem; margin-left: auto; }
    .nav-cta {
      font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem; font-weight: 600;
      padding: 0.5rem 1.1rem;
      background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); color: #A78BFA;
      border-radius: 999px; text-decoration: none;
      transition: background 0.18s, border-color 0.18s, color 0.18s; white-space: nowrap;
    }
    .nav-cta:hover { background: rgba(124,58,237,0.25); border-color: rgba(124,58,237,0.55); color: #C0A8FF; }
    .nav-user { position: relative; cursor: pointer; }
    .user-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, #7C3AED, #DC40C8);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Space Grotesk', sans-serif; font-size: 0.875rem; font-weight: 700; color: #fff;
    }
    .user-menu {
      position: absolute; top: calc(100% + 0.5rem); right: 0;
      background: #131320; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 0.75rem;
      min-width: 200px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      z-index: 200;
    }
    .user-menu-name { font-family: 'Space Grotesk', sans-serif; font-size: 0.875rem; font-weight: 600; color: #F2F2FF; }
    .user-menu-email { font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: #555577; margin-top: 0.2rem; }
    .user-menu-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 0.6rem 0; }
    .user-menu-item {
      width: 100%; text-align: left; background: none; border: none;
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: #FF8899;
      padding: 0.4rem 0.25rem; cursor: pointer; border-radius: 6px;
      transition: background 0.15s;
    }
    .user-menu-item:hover { background: rgba(255,68,102,0.1); }

    .main-content { min-height: calc(100vh - 62px); }

    /* Footer */
    .footer {
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: 4rem;
      background: rgba(7,7,16,0.8);
    }
    .footer-inner {
      max-width: 1200px; margin: 0 auto;
      padding: 3rem 2rem 2rem;
      display: grid; grid-template-columns: 1fr auto 1fr; gap: 2rem; align-items: start;
    }
    .footer-brand { display: flex; flex-direction: column; gap: 0.5rem; }
    .footer-tagline { font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: #444466; }
    .footer-newsletter { display: flex; flex-direction: column; gap: 0.75rem; align-items: center; }
    .footer-nl-label { font-family: 'Space Grotesk', sans-serif; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.05em; color: #6666AA; text-transform: uppercase; }
    .footer-nl-form { display: flex; gap: 0.5rem; }
    .footer-nl-input {
      font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
      padding: 0.55rem 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 999px; color: #F2F2FF; outline: none; width: 200px;
      transition: border-color 0.15s;
    }
    .footer-nl-input:focus { border-color: rgba(124,58,237,0.5); }
    .footer-nl-input::placeholder { color: #444466; }
    .footer-nl-btn {
      font-family: 'Space Grotesk', sans-serif; font-size: 0.8rem; font-weight: 600;
      padding: 0.55rem 1.25rem; background: var(--gradient); color: #fff; border: none;
      border-radius: 999px; cursor: pointer; transition: opacity 0.15s; white-space: nowrap;
    }
    .footer-nl-btn:hover { opacity: 0.85; }
    .footer-nl-msg { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: #4DFFC0; }
    .footer-copy { font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: #333355; text-align: right; align-self: end; }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  searchQuery = '';
  userMenuOpen = signal(false);
  nlEmail = '';
  nlMsg = signal('');
  year = new Date().getFullYear();

  search(): void {
    if (!this.searchQuery.trim()) return;
    this.router.navigate(['/posts'], { queryParams: { q: this.searchQuery.trim() } });
    this.searchQuery = '';
  }

  toggleUserMenu(): void { this.userMenuOpen.update(v => !v); }

  logout(): void {
    this.auth.logout();
    this.userMenuOpen.set(false);
    this.router.navigate(['/posts']);
  }

  subscribe(): void {
    if (!this.nlEmail.trim()) return;
    this.http.post('http://localhost:8080/api/newsletter/subscribe', { email: this.nlEmail })
      .subscribe({
        next: (r: any) => { this.nlMsg.set(r.message); this.nlEmail = ''; },
        error: () => { this.nlMsg.set('Something went wrong. Try again.'); },
      });
  }
}
