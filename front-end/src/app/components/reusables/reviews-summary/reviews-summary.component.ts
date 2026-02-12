import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserGameService } from '../../../services/user-game.service';
import { ReviewService } from '../../../services/reviews.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reviews-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews-summary.component.html',
  styleUrls: ['./reviews-summary.component.css']
})
export class ReviewsSummaryComponent implements OnInit {
  @Input() userId!: number;
  @Input() isOwnProfile = false;

  reviews: any[] = [];
  loading = true;
  errorMessage: string = '';
  private reviewSubscription?: Subscription;

  constructor(
    private reviewsService: ReviewService,
    private userGameService: UserGameService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('ReviewsSummary init - userId:', this.userId, 'isOwnProfile:', this.isOwnProfile);
    
    if (!this.userId) {
      console.error('ERROR: userId no está definido!');
      this.errorMessage = 'Error: User ID no está disponible';
      this.loading = false;
      return;
    }
    
    this.loadReviews();

    this.reviewSubscription = this.reviewsService.reviewAdded$.subscribe(
      (newReview) => {
        console.log('Nueva review detectada, actualizando lista...', newReview);
        if (this.isOwnProfile) {
          this.loadReviews();
        }
      }
    );
  }

  loadReviews() {
    this.loading = true;
    this.errorMessage = '';
    console.log('Cargando reviews para userId:', this.userId);

    this.reviewsService.getReviewsByUserId(this.userId).subscribe({
      next: (data) => {
        console.log('Reviews recibidas:', data.length, 'items');
        
        data.forEach((review, index) => {
          console.log(`Review ${index}:`, {
            id: review.id,
            gameName: review.gameName,
            reviewPreview: review.review?.substring(0, 30) + '...',
            createdAt: review.createdAt,
            userId: review.userId
          });
        });

        this.reviews = data
          .filter(review => {
            const isValid = review && review.gameId && review.review;
            if (!isValid) {
              console.error('Review inválida filtrada:', review);
            }
            return isValid;
          })
          .sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        
        console.log('Reviews después de filtrar/ordenar:', this.reviews.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando reviews:', err);
        this.errorMessage = `Error loading reviews: ${err.status} ${err.statusText}`;
        this.loading = false;
      }
    });
  }

  seeGameDetail(gameId: number) {
    this.router.navigate(['/detail', gameId]);
  }

  ngOnDestroy() {
    if (this.reviewSubscription) {
      this.reviewSubscription.unsubscribe();
    }
  }
}