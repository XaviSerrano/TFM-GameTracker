import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';
import { ModalManagerController } from './components/reusables/modals/modal-manager/modal-manager.component';
import { NavComponent } from './components/reusables/nav/nav.component';
import { AlertModalComponent } from './components/shared/alert-modal/alert-modal.component';
import { AlertService } from './services/alert.service';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavComponent,
    ModalManagerController,
    FooterComponent,
    AlertModalComponent,
    IonApp,
    IonRouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  showNav = false;
  isMobile = false;

  constructor(
    private router: Router,
    public alertService: AlertService,
    private platform: Platform
  ) {
    // Detectar si es app nativa (Capacitor)
    this.isMobile = this.platform.is('capacitor');

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNav = event.urlAfterRedirects !== '/';
      });
  }
}