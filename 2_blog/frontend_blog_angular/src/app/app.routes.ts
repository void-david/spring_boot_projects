import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  {
    path: 'posts',
    loadChildren: () => import('./features/posts/posts.routes').then(m => m.POSTS_ROUTES),
  },
  {
    path: 'categories',
    loadChildren: () => import('./features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES),
  },
];
