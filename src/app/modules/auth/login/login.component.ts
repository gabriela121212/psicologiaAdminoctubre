import {
  Component,
  inject,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { UserModel } from '../../../core/models/user.model';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  public user$: Observable<UserModel | null> = this.authService.user$;
  public isLoading = false;
  public errorMessage: string | null = null;

  ngOnInit() {
    this.user$.pipe(take(1)).subscribe((user) => {
      if (user) {
        this.router.navigate(['/admin']);
      }
    });
  }

  async login() {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      await this.authService.loginWithGoogle();
      this.user$.pipe(take(1)).subscribe((user) => {
        if (user) {
          this.router.navigate(['/admin']);
        }
      });
    } catch (error) {
      console.error('Error en el login:', error);
      this.errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

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
}
