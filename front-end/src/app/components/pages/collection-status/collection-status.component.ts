import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserGameService } from '../../../services/user-game.service';
import { GameCardComponent } from '../../reusables/game-card/game-card.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
// import { AuthService } from '../../../auth/auth.service'; // Cambiar
import { CollectionStatusChartComponent } from '../../reusables/collection-status-chart/collection-status-chart.component';

@Component({
  selector: 'app-collection-status',
  standalone: true,
  imports: [
    CommonModule,
    GameCardComponent,
    CollectionStatusChartComponent
  ],
  templateUrl: './collection-status.component.html',
  styleUrls: ['./collection-status.component.css']
})
export class CollectionStatusComponent implements OnInit {

  userName = '';
  visitedUserId: number | null = null;

  statuses = [
    { key: 'Playing', label: 'Playing' },
    { key: 'Played', label: 'Played' },
    { key: 'Completed', label: 'Completed 100%' },
    { key: 'Abandoned', label: 'Abandoned' },
  ];

  chartReady = false;

  gamesByStatus: Record<string, any[]> = {};
  statusCounts: Record<string, number> = {};
  selectedTab: string = 'Playing';

  constructor(
    private userGameService: UserGameService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.statuses.forEach(s => {
      this.gamesByStatus[s.key] = [];
      this.statusCounts[s.key] = 0;
    });

    this.route.queryParamMap.subscribe(params => {
      const userId = params.get('userId');

      if (userId) {
        this.visitedUserId = Number(userId);
        this.userName = 'User';
        this.loadPublicCollection(this.visitedUserId);
      } else {
        this.visitedUserId = null;
        this.authService.currentUser$.subscribe(user => {
          this.userName = user?.username || 'Usuario';
          this.loadPrivateCollection();
        });
      }
    });
  }

  loadPrivateCollection() {
    for (const status of this.statuses) {
      this.userGameService.getGamesByStatus(status.key).subscribe({
        next: games => this.assignGames(status.key, games),
        error: err => console.log(err)
      });
    }
  }

  loadPublicCollection(userId: number) {
    for (const status of this.statuses) {
      this.userGameService.getUserGamesByStatus(userId, status.key).subscribe({
        next: games => this.assignGames(status.key, games),
        error: err => console.log(err)
      });
    }
  }

  private assignGames(statusKey: string, games: any[]) {
    this.gamesByStatus[statusKey] = games.map(g => ({
      id: g.gameId,
      name: g.gameName,
      backgroundImage: g.backgroundImage,
      status: g.status,
      rating: g.rating,
    }));

    this.statusCounts = {
      ...this.statusCounts,
      [statusKey]: games.length
    };

    const total = Object.values(this.statusCounts).reduce((a, b) => a + b, 0);
    this.chartReady = total > 0;
  }


  selectTab(statusKey: string) {
    this.selectedTab = statusKey;
  }

  seeGameDetail(gameId: number) {
    this.router.navigate(['/detail', gameId]);
  }
}
