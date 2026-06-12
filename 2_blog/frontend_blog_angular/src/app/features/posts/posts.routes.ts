import { Routes } from '@angular/router';

export const POSTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./post-list/post-list.component').then(m => m.PostListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./post-form/post-form.component').then(m => m.PostFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./post-form/post-form.component').then(m => m.PostFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./post-detail/post-detail.component').then(m => m.PostDetailComponent),
  },
];
