import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../../services/wishlist.service';
import { GameCardComponent } from '../../game-card/game-card.component';
import { AuthService } from '../../../services/auth.service';
// import { AuthService } from '../../../auth/auth.service'; // Cambiar
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {

  wishlist: any[] = [];
  loading = true;
  error = '';
  userName = '';
  visitedUserId: number | null = null;

  constructor(
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const userId = params.get('userId');

      if (userId) {
        this.visitedUserId = Number(userId);
        this.userName = 'User';
        this.loadPublicWishlist(this.visitedUserId);
      } else {
        this.visitedUserId = null;

        this.authService.currentUser$.subscribe(currentUser => {
          this.userName = currentUser?.username || 'Usuario';
          this.loadPrivateWishlist();
        });
      }
    });
  }

  // PRIVATE WISHLIST (DEL USUARIO LOGUEADO)
  loadPrivateWishlist() {
    this.loading = true;

    this.wishlistService.getWishlist().subscribe({
      next: data => {
        this.wishlist = data.map(item => ({
          gameId: item.gameId,
          gameName: item.gameName,
          backgroundImage: item.backgroundImage,
          rating: item.rating
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Error loading wishlist';
        this.loading = false;
      }
    });
  }

  // PUBLIC WISHLIST
  loadPublicWishlist(userId: number) {
    this.loading = true;

    this.wishlistService.getWishlistByUser(userId).subscribe({
      next: data => {
        this.wishlist = data.map(item => ({
          gameId: item.gameId,
          gameName: item.gameName,
          backgroundImage: item.backgroundImage,
          rating: item.rating
        }));
        this.loading = false;
      },
      error: (err) => {
        console.log('🔥 Error real del backend:', err);
        this.error = 'Error loading public wishlist';
        this.loading = false;
      }
    });
  }


  // REMOVE (solo si es wishlist propia)
  removeFromWishlist(game: any) {
    if (this.visitedUserId) return;

    this.wishlistService.removeFromWishlist(game.gameId).subscribe({
      next: () => {
        this.wishlist = this.wishlist.filter(g => g.gameId !== game.gameId);
      },
      error: (err) => console.error(err)
    });
  }

  seeGameDetail(gameId: number) {
    this.router.navigate(['/detail', gameId]);
  }

  trackByGameId(index: number, game: any) {
    return game.gameId;
  }
}
