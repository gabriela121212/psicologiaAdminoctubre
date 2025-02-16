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

  user$: Observable<User | null> = this.authService.getUser();

  sidebarRoutes: SidebarRoute[] = [
    { label: 'Dashboard', path: '/' },
    { label: 'Tematicas', path: '/admin/tematicas' },
    { label: 'Colores Login', path: '/admin/colores' },
  ];

  logout() {
    this.authService.logout();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
