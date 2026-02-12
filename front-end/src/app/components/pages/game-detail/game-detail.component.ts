// game-detail.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IgdbService } from '../../../services/igdb.service'; // ✅ Importación corregida
import { CommonModule } from '@angular/common';
import { ModalManagerService } from '../../../services/modal-manager.service';
import { ReviewService } from '../../../services/reviews.service';
import { AuthService } from '../../../services/auth.service';
import { map, combineLatest, catchError, of } from 'rxjs';
import { ProfileSyncService } from '../../../services/profile-sync.service';
import { UserGameService } from '../../../services/user-game.service';
import { GameActionsComponent } from '../../reusables/game-actions/game-actions.component';

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
  
  activeTab: 'overview' | 'media' | 'reviews' = 'overview';
  
  lightboxOpen = false;
  currentScreenshotIndex = 0;
  
  placeholderImage = 'assets/images/icons/profile.svg';
  
  currentUser: any = null;

  averageTimes?: {
    hastily?: number;
    normally?: number;
    completely?: number;
  };

  constructor(
    private route: ActivatedRoute,
    private igdbService: IgdbService, // ✅ Cambiado de rawgService a igdbService
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

  private handleReviewImage(review: any) {
    return {
      ...review,
      profileImage: review.profileImage || this.currentUser?.profileImage || this.placeholderImage,
      displayName: review.displayName || this.currentUser?.displayName || review.username
    };
  }

  // ✅ LOADGAME CORREGIDO - MEJOR MANEJO DE ERRORES
  loadGame() {
    this.igdbService.getGameById(this.gameId).subscribe({
      next: (data: any) => {
        this.game = data;
        this.loading = false;
        console.log('🎮 Game loaded:', this.game);

        // Obtener tiempos de juego - CON MANEJO DE ERRORES MEJORADO
        this.igdbService.getTimeToBeat(this.gameId).subscribe({
          next: (times) => {
            // ✅ Convertir de segundos a horas (IGDB devuelve segundos)
            this.averageTimes = {
              hastily: times?.hastily ? Math.round(times.hastily / 3600) : undefined,
              normally: times?.normally ? Math.round(times.normally / 3600) : undefined,
              completely: times?.completely ? Math.round(times.completely / 3600) : undefined,
            };
            console.log('⏱ Time to beat (hours):', this.averageTimes);
          },
          error: (err) => {
            console.log('ℹ️ No time-to-beat data available for this game');
            this.averageTimes = {}; // ✅ Muestra N/A en el template
          }
        });

      },
      error: (err) => {
        console.error('❌ Error loading game:', err);
        this.loading = false;
        this.averageTimes = {};
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

    this.reviewsService.setGameReview(
      game.id,
      review,
      game.name,
      game.backgroundImage
    ).subscribe({
      next: (newReview) => {
        const processedReview = this.handleReviewImage(newReview);
        this.reviews = [processedReview, ...this.reviews];
        this.limitedReviews = this.reviews.slice(0, 4);
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        alert('Error submitting review');
      }
    });
  }

  // ... (resto de métodos lightbox sin cambios)
  openLightbox(index: number) {
    this.currentScreenshotIndex = index;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    document.body.style.overflow = 'auto';
  }

  nextScreenshot(event: Event) {
    event.stopPropagation();
    if (this.currentScreenshotIndex < this.game.screenshots.length - 1) {
      this.currentScreenshotIndex++;
    }
  }

  prevScreenshot(event: Event) {
    event.stopPropagation();
    if (this.currentScreenshotIndex > 0) {
      this.currentScreenshotIndex--;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (!this.lightboxOpen) return;

    switch(event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowRight':
        if (this.currentScreenshotIndex < this.game.screenshots.length - 1) {
          this.currentScreenshotIndex++;
        }
        break;
      case 'ArrowLeft':
        if (this.currentScreenshotIndex > 0) {
          this.currentScreenshotIndex--;
        }
        break;
    }
  }
}