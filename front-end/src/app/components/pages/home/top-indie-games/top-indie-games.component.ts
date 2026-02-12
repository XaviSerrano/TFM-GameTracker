import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IgdbService } from '../../../../services/igdb.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { GameCardComponent } from '../../../game-card/game-card.component';

@Component({
  selector: 'app-top-indie-games',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './top-indie-games.component.html',
  styleUrls: ['./top-indie-games.component.css'],
})
export class TopIndieGamesComponent implements OnInit {
  indieGames: any[] = [];
  displayedGames: any[] = [];
  loading = true;
  pageSize = 24;

  constructor(
    private igdbService: IgdbService,
    private wishlistService: WishlistService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.igdbService.getTopIndieGames().subscribe({
      next: (data) => {
        this.indieGames = data.results;
        this.displayedGames = this.indieGames.slice(0, this.pageSize);
        this.applyWishlist();
      },
      error: (err) => console.error('Error cargando juegos indie:', err),
      complete: () => (this.loading = false),
    });
  }

  applyWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        const ids = wishlist.map((item: any) => item.gameId);
        this.displayedGames = this.displayedGames.map((g) => ({
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

  loadMore() {
    const currentLength = this.displayedGames.length;
    const nextGames = this.indieGames.slice(
      currentLength,
      currentLength + this.pageSize,
    );
    this.displayedGames = [...this.displayedGames, ...nextGames];
    this.applyWishlist();
  }
}
