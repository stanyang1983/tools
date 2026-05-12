import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LayoutService } from './shared/layout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <div class="app-body">
        <app-sidebar />
        @if (layout.sidebarOpen()) {
          <div class="sidebar-overlay" (click)="layout.close()"></div>
        }
        <main class="app-main">
          <router-outlet />
          <app-footer />
        </main>
      </div>
    </div>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public layout: LayoutService) {}
}
