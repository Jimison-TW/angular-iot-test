import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // 預設導向 Dashboard
  { path: 'dashboard', component: Dashboard },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
