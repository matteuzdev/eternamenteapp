import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing').then(m => m.LandingPage)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/overview').then(m => m.OverviewPage)
      },
      {
        path: 'guests',
        loadComponent: () => import('./pages/dashboard/guests').then(m => m.GuestsPage)
      },
      {
        path: 'editor',
        loadComponent: () => import('./pages/dashboard/editor').then(m => m.DashboardEditorComponent)
      },
      {
        path: 'gifts',
        loadComponent: () => import('./pages/dashboard/gifts').then(m => m.GiftsPage)
      }
    ]
  },
  {
    path: 'i/:coupleId/c/:guestId',
    loadComponent: () => import('./pages/invite').then(m => m.InvitePage)
  }
];
