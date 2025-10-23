import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard/taipei', pathMatch: 'full' }, // 預設導向 Dashboard
  { path: 'dashboard/:city', component: Dashboard },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
