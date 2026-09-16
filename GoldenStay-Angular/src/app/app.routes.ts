import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    title: 'GoldenStay — Dimore d\'autore sulla Costa degli Dei',
    loadComponent: () =>
      import('./features/room-list/room-list.component').then(m => m.RoomListComponent),
  },
  {
    path: 'room/:id',
    title: 'La camera — GoldenStay',
    loadComponent: () => import('./features/room-detail/room-detail').then(m => m.RoomDetail),
  },
  {
    path: 'login',
    title: 'Accedi — GoldenStay',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    title: 'Registrati — GoldenStay',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
  },

  // Back office: riservato agli amministratori.
  {
    path: 'admin-dashboard',
    title: 'Camere — Back office',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
  },
  {
    path: 'admin/booking',
    title: 'Prenotazioni — Back office',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/admin-booking/admin-booking').then(m => m.AdminBookingsComponent),
  },
  {
    path: 'create-room',
    title: 'Nuova camera — Back office',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/create-room/create-room').then(m => m.CreateRoomComponent),
  },

  { path: '**', redirectTo: '' },
];
