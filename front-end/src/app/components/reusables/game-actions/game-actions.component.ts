import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { ModalManagerService } from '../../../services/modal-manager.service';
import { UserGameService } from '../../../services/user-game.service';
import { WishlistService } from '../../../services/wishlist.service';
import { RatingModalComponent } from '../modals/rating-modal/rating-modal.component';

@Component({
  selector: 'app-game-actions',
  standalone: true,
  imports: [CommonModule, RatingModalComponent],
  templateUrl: './game-actions.component.html',
  styleUrl: './game-actions.component.css',
})

export class GameActionsComponent implements OnInit {
  @Input() game!: any;
  @Input() isBookmarked = false;

  @Output() bookmarkToggled = new EventEmitter<boolean>();

  currentStatus: string | null = null;
  currentRating: number | null = null;

  showRatingModal = false;

  constructor(
    private authService: AuthService,
    private wishlistService: WishlistService,
    private userGameService: UserGameService,
    private router: Router,
    private modalManager: ModalManagerService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {

    if (!this.game) {
      console.warn('[GameActions] game is undefined/null');
      return;
    }

    console.log('[GameActions] game received:', this.game);
    console.log('[GameActions] resolved id:', this.getGameId());
    console.log('[GameActions] token:', this.authService.getToken() ? 'EXISTS' : 'MISSING');


    this.loadGameStatus();
    this.loadBookmarkStatus();

    this.modalManager.statusChanged$.subscribe(change => {
      if (!change || change.gameId !== this.getGameId()) return;
      this.currentStatus = change.status;
    });
  }

  /** 🔹 Normaliza el id del juego */
  private getGameId(): number {
    return this.game?.gameId ?? this.game?.id;
  }

  private loadGameStatus() {
    const gameId = this.getGameId();
    if (!gameId) {
      console.log('[GameActions] gameId is undefined, skipping loadGameStatus');
      return;
    }
    this.userGameService.getGameStatus(gameId).subscribe({
      next: (res) => {
        this.currentStatus = res.status || null;
        this.currentRating = res.rating ?? 0;
      },
      error: () => {
        this.currentStatus = null;
        this.currentRating = 0;
      },
    });
  }

  // ⭐ BOOKMARK
  toggleBookmark(event: MouseEvent) {
    event.stopPropagation();
    console.log('[GameActions] toggleBookmark, isLoggedIn:', this.authService.isLoggedIn());
    console.log('[GameActions] toggleBookmark, gameId:', this.getGameId());
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const gameId = this.getGameId();
    if (!gameId) return; // 🛡️ evita NaN

    const action$ = this.isBookmarked
      ? this.wishlistService.removeFromWishlist(gameId)
      : this.wishlistService.addToWishlist({
          gameId,
          gameName: this.game.name,
          backgroundImage: this.game.backgroundImage,
          rating: this.game.rating,
        });

    action$.subscribe({
      next: () => {
        this.isBookmarked = !this.isBookmarked;
        this.bookmarkToggled.emit(this.isBookmarked);

        this.alertService.show(
          this.isBookmarked
            ? 'GAME_ADDED_TO_WISHLIST'
            : 'GAME_REMOVED_FROM_WISHLIST'
        );
      },
      error: (err) => this.handleAuthError(err),
    });
  }

  private loadBookmarkStatus() {
    const gameId = this.getGameId();
    if (!gameId) return;

    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        const safe = Array.isArray(wishlist) ? wishlist : [];
        this.isBookmarked = safe.some((g) => g.gameId === gameId);
      },
    });
  }

  // ⭐ RATING
  openRatingModal(event: MouseEvent) {
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.showRatingModal = true;
  }

  onSaveRating(value: number) {
    const gameId = this.getGameId();
    if (!gameId) return;

    this.userGameService.setGameRating(gameId, value).subscribe({
      next: () => {
        this.currentRating = value;
        this.showRatingModal = false;
      },
      error: (err) => console.error('Error saving rating:', err),
    });
  }

  private handleAuthError(err: any) {
    if (err.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    } else {
      console.error(err);
    }
  }

  openStatusModal(game: any, event: Event) {
    event.stopPropagation();
    console.log('[GameActions] openStatusModal called with:', game);
    this.modalManager.openStatusModal(game);
  }

  openCustomListModal(game: any, event: MouseEvent) {
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    console.log('[GameActions] openCustomListModal game:', game);
    this.modalManager.openCustomListModal(game);
  }
}

