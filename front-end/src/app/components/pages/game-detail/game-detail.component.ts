import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RawgService } from '../../../services/rawg.service';
import { GameActionsComponent } from '../../game-actions/game-actions.component';
import { CommonModule } from '@angular/common';
import { ModalManagerService } from '../../../services/modal-manager.service';
import { UserGameService } from '../../../services/user-game.service';
import { ReviewService } from '../../../services/reviews.service';
import { AuthService } from '../../../services/auth.service';
import { map, combineLatest } from 'rxjs';
import { ProfileSyncService } from '../../../services/profile-sync.service';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, GameActionsComponent],
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.css']
})
export class GameDetailComponent implements OnInit {
  gameId!: number;
  game: any;
  reviews: any[] = [];
  limitedReviews: any[] = [];
  showAll = false;
  loading = true;
  
  placeholderImage = 'assets/images/icons/profile.svg';
  
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private rawgService: RawgService,
    private reviewsService: ReviewService,
    private userGameService: UserGameService,
    public modalManager: ModalManagerService,
    public authService: AuthService,
    private profileSync: ProfileSyncService

  ) {}

  ngOnInit() {
    const gameId$ = this.route.paramMap.pipe(
      map(params => Number(params.get('id')))
    );

    combineLatest([gameId$, this.authService.token$]).subscribe(
      ([gameId, _token]) => {
        this.gameId = gameId;
        this.loadGame();
        this.loadReviews();
      }
    );

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.modalManager.reviewAdded$.subscribe((newReview: any) => {
      if (!newReview) return;
      const processedReview = this.handleReviewImage(newReview);
      this.reviews.unshift(processedReview);
      this.limitedReviews = this.reviews.slice(0, 4);
    });

    this.profileSync.profileUpdated$.subscribe(updatedUser => {
      if (updatedUser && this.currentUser?.id === updatedUser.id) {
        this.currentUser = {
          ...this.currentUser,
          profileImage: updatedUser.profileImage,
          displayName: updatedUser.displayName
        };
        
        this.reviews = this.reviews.map(review => {
          if (review.username === this.currentUser.username) {
            return {
              ...review,
              profileImage: updatedUser.profileImage || this.placeholderImage,
              displayName: updatedUser.displayName || review.username
            };
          }
          return review;
        });
        
        this.limitedReviews = this.reviews.slice(0, 4);
      }
    });
  }

  // UTILIDAD PARA IMÁGENES DE PERFIL EN REVIEWS

  private handleReviewImage(review: any) {
    return {
      ...review,
      profileImage: review.profileImage || this.currentUser?.profileImage || this.placeholderImage,
      displayName: review.displayName || this.currentUser?.displayName || review.username
    };
  }

  loadGame() {
    this.rawgService.getGameById(this.gameId).subscribe({
      next: (data: any) => {
        this.game = data;
        this.loading = false;
      },
      error: (err) => {
        console.log('Error cargando el juego:', err);
        this.loading = false;
      }
    });
  }

  loadReviews() {
    this.reviewsService.getGameReviews(this.gameId).subscribe({
      next: (reviews) => {
        this.reviews = reviews.map(review => this.handleReviewImage(review));
        this.limitedReviews = this.reviews.slice(0, 4);
      },
      error: (err) => console.error('Error cargando reviews:', err)
    });
  }


  submitReview(data: { review: string, game: any }) {
    const { review, game } = data;

    if (!game || !game.name) return;

    console.log('🚀 Enviando review...');

    this.reviewsService.setGameReview(
      game.id,
      review,
      game.name,
      game.backgroundImage
    ).subscribe({
      next: (newReview) => {
        console.log('✅ Review creada, respuesta:', newReview);

        const processedReview = this.handleReviewImage(newReview);

        this.reviews = [processedReview, ...this.reviews];
        this.limitedReviews = this.reviews.slice(0, 4);

        console.log('✅ Review final con imagen:', processedReview.profileImage);
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        alert('Error submitting review');
      }
    });
  }

}