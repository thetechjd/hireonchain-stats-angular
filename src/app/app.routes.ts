import { Routes } from '@angular/router';
import { JobStatsDashboardComponent } from './dashboard/job-stats-dashboard.component';

export const routes: Routes = [
  { 
    path: '', 
    component: JobStatsDashboardComponent 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];