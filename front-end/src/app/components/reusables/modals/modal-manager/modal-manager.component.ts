import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ModalManagerService } from '../../../../services/modal-manager.service';
import { ReviewService } from '../../../../services/reviews.service';
import { UserGameService } from '../../../../services/user-game.service';
import { GameStatusModalComponent } from '../game-status-modal/game-status-modal.component';
import { PlaytimeModalComponent } from '../playtime-modal/playtime-modal.component';
import { RatingModalComponent } from '../rating-modal/rating-modal.component';
import { ReviewModalComponent } from '../review-modal/review-modal.component';
import { SelectCustomListModalComponent } from '../select-custom-list-modal/select-custom-list-modal.component';

@Component({
  selector: 'app-modal-manager',
  standalone: true,
  imports: [
    CommonModule,
    GameStatusModalComponent,
    RatingModalComponent,
    PlaytimeModalComponent,
    ReviewModalComponent,
    SelectCustomListModalComponent,
  ],
  templateUrl: './modal-manager.component.html',
  styleUrls: ['./modal-manager.component.css'],
})
export class ModalManagerController implements OnInit {
  showStatus = false;
  showRatingModal = false;
  showPlaytimeModal = false;
  showReviewModal = false;
  showCustomListModal = false;

  currentGame: any = null;

  constructor(
    private modalManager: ModalManagerService,
    private reviewsService: ReviewService,
    private userGameService: UserGameService,
  ) {}

  ngOnInit() {
    this.modalManager.statusModal$.subscribe(async (state) => {
      if (!state.game) return;

      try {
        const userGame = await firstValueFrom(
          this.userGameService.getGameStatus(state.game.id),
        );

        this.currentGame = {
          ...state.game,
          status: userGame.status ?? null,
          rating: userGame.rating ?? 0,
          playtime: userGame.playtime ?? 0,
          // review: userGame.review ?? '',
        };
      } catch {
        this.currentGame = {
          ...state.game,
          status: null,
          rating: 0,
          playtime: 0,
          review: '',
        };
      }

      this.showStatus = state.show;
    });

    this.modalManager.ratingModal$.subscribe((state) => {
      if (!state.game) return;
      this.currentGame = state.game;
      this.showRatingModal = state.show;
    });

    this.modalManager.playtimeModal$.subscribe((state) => {
      if (!state.game) return;
      this.currentGame = state.game;
      this.showPlaytimeModal = state.show;
    });

    this.modalManager.reviewModal$.subscribe((state) => {
      if (!state.game) return;
      this.currentGame = state.game;
      this.showReviewModal = state.show;
    });

    this.modalManager.customListModal$.subscribe((state) => {
      this.currentGame = state.game;
      this.showCustomListModal = state.show;
    });
  }

  onSelectStatus(status: string | null) {
    if (!this.currentGame) return;

    if (status === null) {
      this.currentGame.status = null;
      this.modalManager.notifyStatusChanged(this.currentGame.id, null); // ← AÑADE
      return;
    }

    this.userGameService
      .setGameStatus(
        this.currentGame.id,
        status,
        this.currentGame.name,
        this.currentGame.backgroundImage,
      )
      .subscribe((updated) => {
        this.currentGame.status = updated.status;
        this.modalManager.notifyStatusChanged(this.currentGame.id, status); // ← AÑADE
        this.showStatus = false;
        this.showRatingModal = true;
      });
  }

  onSaveRating(rating: number) {
    if (!this.currentGame) return;

    this.userGameService
      .setGameRating(this.currentGame.id, rating)
      .subscribe((updated) => {
        this.currentGame.rating = updated.rating;
        this.showRatingModal = false;
        this.showPlaytimeModal = true;
      });
  }

  onSetPlaytime(playtime: number) {
    if (!this.currentGame) return;

    this.userGameService
      .setGamePlaytime(this.currentGame.id, playtime)
      .subscribe((updated) => {
        this.currentGame.playtime = updated.playtime;
        this.showPlaytimeModal = false;
      });
  }

  onSaveReview(review: string) {
    if (!this.currentGame) return;

    this.reviewsService
      .setGameReview(
        this.currentGame.id,
        review,
        this.currentGame.name,
        this.currentGame.backgroundImage,
      )
      .subscribe({
        next: (updatedReview) => {
          this.currentGame.review = updatedReview.review;
          this.showReviewModal = false;

          this.modalManager.notifyReviewAdded(updatedReview);
        },
        error: (err) => {
          console.log(err);
          if (err.status === 400 && err.error?.message) {
            alert(err.error.message);
          } else {
            alert('Error al guardar la review.');
          }
        },
      });
  }
}
