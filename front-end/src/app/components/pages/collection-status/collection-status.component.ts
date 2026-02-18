import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserGameService } from '../../../services/user-game.service';
import { GameCardComponent } from '../../reusables/game-card/game-card.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CollectionStatusChartComponent } from '../../reusables/collection-status-chart/collection-status-chart.component';
import { ModalManagerService } from '../../../services/modal-manager.service';
import { Subject, takeUntil } from 'rxjs';

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
export class CollectionStatusComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

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
    private route: ActivatedRoute,
    private modalManager: ModalManagerService
  ) {}

  ngOnInit() {
    // Inicializar estructuras
    this.statuses.forEach(s => {
      this.gamesByStatus[s.key] = [];
      this.statusCounts[s.key] = 0;
    });

    // Detectar si es perfil público o privado
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const userId = params.get('userId');

        if (userId) {
          this.visitedUserId = Number(userId);
          this.userName = 'User';
          this.loadPublicCollection(this.visitedUserId);
        } else {
          this.visitedUserId = null;

          this.authService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
              this.userName = user?.username || 'Usuario';
              this.loadPrivateCollection();
            });
        }
      });

    // Refrescar colección cuando cambia estado desde el modal
    this.modalManager.statusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(change => {
        if (!change || this.visitedUserId) return;
        this.loadPrivateCollection();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== CARGAS =====

  loadPrivateCollection() {
    this.resetData();

    for (const status of this.statuses) {
      this.userGameService.getGamesByStatus(status.key)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: games => this.assignGames(status.key, games),
          error: err => console.log(err)
        });
    }
  }

  loadPublicCollection(userId: number) {
    this.resetData();

    for (const status of this.statuses) {
      this.userGameService.getUserGamesByStatus(userId, status.key)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: games => this.assignGames(status.key, games),
          error: err => console.log(err)
        });
    }
  }

  // ===== HELPERS =====

  private resetData() {
    this.chartReady = false;

    this.statuses.forEach(s => {
      this.gamesByStatus[s.key] = [];
      this.statusCounts[s.key] = 0;
    });
  }

  private assignGames(statusKey: string, games: any[]) {
    this.gamesByStatus[statusKey] = games.map(g => ({
      id: g.gameId,
      name: g.gameName,
      backgroundImage: g.backgroundImage,
      status: g.status,
      rating: g.rating,
    }));

    this.statusCounts[statusKey] = games.length;

    const total = Object.values(this.statusCounts).reduce((a, b) => a + b, 0);
    this.chartReady = total > 0;
  }

  // ===== UI =====

  selectTab(statusKey: string) {
    this.selectedTab = statusKey;
  }

  seeGameDetail(gameId: number) {
    this.router.navigate(['/detail', gameId]);
  }
}
