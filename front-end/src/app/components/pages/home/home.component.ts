// home.component.ts
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrendingGamesComponent } from './trending-games/trending-games.component';
import { Top250GamesComponent } from './top-250-games/top-250-games.component';
import { TopIndieGamesComponent } from './top-indie-games/top-indie-games.component';

type HomeSection = 'trending' | 'top250' | 'indies';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TrendingGamesComponent,
    Top250GamesComponent,
    TopIndieGamesComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  selectedSection: HomeSection = 'trending';
  isSidebarVisible = true;
  
  isMobileSidebarOpen = false;
  
  isMobile = window.innerWidth <= 768;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isMobileSidebarOpen = false;
    }
  }

  selectSection(section: HomeSection) {
    this.selectedSection = section;
    if (this.isMobile) {
      this.isMobileSidebarOpen = false;
    }
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    } else {
      this.isSidebarVisible = !this.isSidebarVisible;
    }
  }

  get shouldShowSidebar(): boolean {
    if (this.isMobile) {
      return this.isMobileSidebarOpen;
    }
    return this.isSidebarVisible;
  }
}