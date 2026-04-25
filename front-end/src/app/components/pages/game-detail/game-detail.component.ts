import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IgdbService, NormalizedGameList } from '../../../services/igdb.service';
import { CommonModule } from '@angular/common';
import { ModalManagerService } from '../../../services/modal-manager.service';
import { ReviewService } from '../../../services/reviews.service';
import { AuthService } from '../../../services/auth.service';
import { map, combineLatest } from 'rxjs';
import { ProfileSyncService } from '../../../services/profile-sync.service';
import { UserGameService } from '../../../services/user-game.service';
import { GameActionsComponent } from '../../reusables/game-actions/game-actions.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // ✅ AÑADE ESTO
import { NormalizedGame } from '../../../services/igdb.service';
import { GameCardComponent } from '../../reusables/game-card/game-card.component';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, GameActionsComponent, GameCardComponent],
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

  platformVersions: any[] = [];
  similarGames: NormalizedGame[] = [];
  
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
    private igdbService: IgdbService,
    private reviewsService: ReviewService,
    private userGameService: UserGameService,
    public modalManager: ModalManagerService,
    public authService: AuthService,
    private profileSync: ProfileSyncService,
    private sanitizer: DomSanitizer
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

  loadGame() {

    // Version movil
    const ionContent = document.querySelector('ion-content');
    if (ionContent) {
      (ionContent as any).scrollToTop(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  

    window.scrollTo({ top: 0, behavior: 'instant' });
    this.igdbService.getGameById(this.gameId).subscribe({
      next: (data: any) => {
        this.game = data;
        this.loading = false;
        console.log('🎮 Game loaded:', this.game);
        console.log('🎬 Trailer URL:', this.game.trailerUrl); // ✅ DEBUG
        
        console.log('Platform object:', this.game.platforms[0]);
        console.log('Type:', typeof this.game.platforms[0]);
        console.log('All platforms:', this.game.platforms);
        if (this.game.platforms && this.game.platforms.length > 0) {
          // ✅ Reemplaza todo el bloque de getPlatformVersions
          this.igdbService.getPlatformVersions(this.gameId).subscribe({
            next: (releaseDates) => {
              // Agrupa las fechas por plataforma
              const grouped: { [key: string]: any } = {};

              releaseDates.forEach((rd: any) => {
                const platformName = rd.platform?.name || 'Unknown';
                if (!grouped[platformName]) {
                  grouped[platformName] = {
                    id: rd.platform?.id || platformName,
                    name: platformName,
                    releases: []
                  };
                }
                grouped[platformName].releases.push({
                  date: rd.date ? new Date(rd.date * 1000) : null,
                  region: rd.region,
                  human: rd.human
                });
              });

              this.platformVersions = Object.values(grouped).map((platform: any) => {
                // ✅ Filtra fechas válidas y quédate con la más temprana
                const validReleases = platform.releases.filter((r: any) => r.date !== null);
                const earliest = validReleases.sort((a: any, b: any) => a.date - b.date)[0];

                return {
                  id: platform.id,
                  name: platform.name,
                  releases: earliest ? [earliest] : []
                };
              }).sort((a, b) => a.name.localeCompare(b.name));
              console.log('🕹 Release Dates by Platform:', this.platformVersions);
            },
            error: (err) => console.error('Error loading release dates:', err)
          });
        }
        // Obtener tiempos de juego
        this.igdbService.getTimeToBeat(this.gameId).subscribe({
          next: (times) => {
            this.averageTimes = {
              hastily: times?.hastily ? Math.round(times.hastily / 3600) : undefined,
              normally: times?.normally ? Math.round(times.normally / 3600) : undefined,
              completely: times?.completely ? Math.round(times.completely / 3600) : undefined,
            };
            console.log('⏱ Time to beat (hours):', this.averageTimes);
          },
          error: (err) => {
            console.log('ℹ️ No time-to-beat data available for this game');
            this.averageTimes = {};
          }
        });
        // Cargar juegos similares
        this.igdbService.getSimilarGames(this.gameId).subscribe({
          next: (data: NormalizedGameList) => {
            console.log('📦 Raw similar games response:', data);
            console.log('📦 Results array:', data?.results);
            console.log('📦 Results length:', data?.results?.length);
            this.similarGames = data.results.slice(0, 8);
            console.log('🎮 Similar games set to:', this.similarGames);
          },
          error: (err: any) => {
            console.error('❌ Error loading similar games:', err);
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

  // ✅ AÑADE ESTE GETTER para sanitizar la URL del trailer
  get safeTrailerUrl(): SafeResourceUrl | null {
    if (!this.game?.trailerUrl) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.game.trailerUrl);
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