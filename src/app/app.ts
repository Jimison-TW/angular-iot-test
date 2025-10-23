import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenubarModule, ButtonModule, DrawerModule, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('天氣監控系統');
  sidebarVisible = signal(true);

  cities = [
    { name: '台北', route: '/weather/taipei', routerLink: ['/dashboard/taipei'] },
    { name: '台中', route: '/weather/taichung', routerLink: ['/dashboard/taichung'] },
    { name: '高雄', route: '/weather/kaohsiung', routerLink: ['/dashboard/kaohsiung'] }
  ];
}
