import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <!-- Solo mostrar navbar y footer cuando NO estamos en rutas admin -->
    <app-navbar *ngIf="!isAdminRoute"></app-navbar>
    <router-outlet></router-outlet>
    <app-footer *ngIf="!isAdminRoute"></app-footer>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'loopmotion';
  isAdminRoute = false;
  private adminRoutes = ['/dashboard', '/loop-admin'];

  constructor(private router: Router) {
    // Subscribirse solo a los eventos NavigationEnd
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Verificar si la URL actual está en la lista de rutas admin
      this.isAdminRoute = this.adminRoutes.some(route => 
        this.router.url.startsWith(route)
      );
    });
  }
}