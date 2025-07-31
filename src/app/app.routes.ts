import { authChildGuard } from './guards/auth-child.guard';
import { Routes } from '@angular/router'; // <- para el tipo Routes
import { LoginComponent } from './modules/auth/login/login.component'; // <- ruta al componente login


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivateChild: [authChildGuard],
    loadChildren: () =>
      import('./modules/admin/admin.routes').then((m) => m.adminRoutes)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];

