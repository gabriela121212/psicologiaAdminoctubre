import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from './modules/auth/services/auth.service';
import { UserModel } from '@core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'piscologia-app';
  private authService = inject(AuthService);
  public user$: Observable<UserModel | null> = this.authService.user$;
}
