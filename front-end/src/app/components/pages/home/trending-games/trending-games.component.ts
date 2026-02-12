import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IgdbService } from '../../../../services/igdb.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { GameCardComponent } from '../../../reusables/game-card/game-card.component';
@Component({
  selector: 'app-trending-games',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './trending-games.component.html',
  styleUrls: ['./trending-games.component.css'],
})
export class TrendingGamesComponent implements OnInit {
  trendingGames: any[] = [];
  loading = true;

  constructor(
    private igdbService: IgdbService,
    private wishlistService: WishlistService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.igdbService.getTrendingGames().subscribe({
      next: (trending) => (this.trendingGames = trending.results),
      error: (err) => console.error('Error cargando trending:', err),
      complete: () => (this.loading = false),
    });

    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        const ids = wishlist.map((item: any) => item.gameId);
        this.trendingGames = this.trendingGames.map((g) => ({
          ...g,
          isBookmarked: ids.includes(g.id),
        }));
      },
      error: (err) => console.log('No se pudo cargar wishlist:', err),
    });
  }

  seeGameDetail(gameId: number) {
    this.router.navigate(['/detail', gameId]);
  }
}
