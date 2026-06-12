import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="header-inner">
        <a routerLink="/posts" class="site-name">The Blog</a>
        <nav class="site-nav">
          <a routerLink="/posts" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}">Posts</a>
          <a routerLink="/categories" routerLinkActive="active">Categories</a>
        </nav>
      </div>
    </header>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    .site-header {
      position: sticky;
      top: 0;
      background: #FAF8F5;
      border-bottom: 1px solid #E0DDD8;
      z-index: 100;
    }
    .header-inner {
      max-width: 1024px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .site-name {
      font-family: 'Lora', serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1A1A1A;
      text-decoration: none;
      transition: color 0.15s;
    }
    .site-name:hover { color: #C76F4A; }
    .site-nav {
      display: flex;
      gap: 1.75rem;
    }
    .site-nav a {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      color: #555;
      text-decoration: none;
      transition: color 0.15s;
    }
    .site-nav a:hover,
    .site-nav a.active { color: #C76F4A; }
    main { min-height: calc(100vh - 60px); }
  `]
})
export class AppComponent {}
