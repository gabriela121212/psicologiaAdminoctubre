import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Router } from '@angular/router';

interface SidebarRoute {
  label: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, AsyncPipe, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  public isLoading = false;
  public errorMessage: string | null = null;

  user$: Observable<User | null> = this.authService.getUser();

  sidebarRoutes: SidebarRoute[] = [
    { label: 'Dashboard', path: '/' },
    { label: 'Tematicas', path: '/admin/tematicas' },
    { label: 'Colores Login', path: '/admin/colores' },
    { label: 'Cuestionario', path: '/admin/cuestionario' },
    { label: 'Informe Personalizado', path: '/admin/informe' },
    { label: 'Menu', path: '/admin/menu' },
  ];

  async logout() {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error en el logout:', error);
      this.errorMessage = 'Error al cerrar sesión. Inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
