import { Routes } from '@angular/router';
import { DashboardComponent } from './modules/admin/dashboard/dashboard.component';
import { TematicasComponent } from './modules/admin/tematicas/tematicas.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'tematicas', component: TematicasComponent },
];



