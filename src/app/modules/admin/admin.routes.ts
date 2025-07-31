import { Routes } from '@angular/router';
import { authChildGuard } from '../../guards/auth-child.guard'; // ajusta según tu ruta real
import { DashboardComponent } from './dashboard/dashboard.component';
import { TematicasComponent } from './tematicas/tematicas.component';
import { ColoresComponent } from './colores/colores.component';
import { CuestionariosComponent } from './cuestionarios/cuestionarios.component';
import { MenuComponent } from './menu/menu.component';
import { InformePComponent } from './informe-p/informe-p.component';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivateChild: [authChildGuard], // 👈 Aplica el guard funcional aquí
    children: [
      { path: '', component: DashboardComponent },
      { path: 'colores', component: ColoresComponent },
      { path: 'tematicas', component: TematicasComponent },
      { path: 'cuestionario', component: CuestionariosComponent },
      { path: 'informe', component: InformePComponent },
      { path: 'menu', component: MenuComponent },
    ]
  }
];
