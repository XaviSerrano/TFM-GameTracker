import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../../services/wishlist.service';
import { GameCardComponent } from '../../reusables/game-card/game-card.component';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FiltersComponent, GameFilters } from '../../reusables/filters/filters.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, GameCardComponent, FiltersComponent],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {

  allGames: any[] = []; // ← lista completa sin filtrar
  wishlist: any[] = []; // ← lista filtrada que se muestra
  loading = true;
  error = '';
  userName = '';
  visitedUserId: number | null = null;

  // Opciones para los dropdowns del filtro
  availableGenres: string[] = [];
  availablePlatforms: string[] = [];

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

private mapGames(data: any[]): any[] {
  return data.map(item => {
    console.log('[Wishlist] item.released:', item); // ← log temporal
    return {
      id: item.gameId,
      name: item.gameName,
      backgroundImage: item.backgroundImage ?? '',
      rating: item.rating,
      released: item.released,
      genres: typeof item.genres === 'string' 
        ? item.genres.split(',') 
        : (item.genres ?? []),
      platforms: typeof item.platforms === 'string'
        ? item.platforms.split(',')
        : (item.platforms ?? []),
    };
  });
}

    private afterLoad(games: any[]) {
    this.allGames = games;
    this.wishlist = games;
    this.buildFilterOptions(games);
    this.loading = false;
  }

  private buildFilterOptions(games: any[]) {
    const genres = new Set<string>();
    const platforms = new Set<string>();
    games.forEach(g => {
      g.genres?.forEach((genre: string) => genres.add(genre));
      g.platforms?.forEach((platform: string) => platforms.add(platform));
    });
    this.availableGenres = Array.from(genres).sort();
    this.availablePlatforms = Array.from(platforms).sort();
  }

  // PRIVATE WISHLIST (DEL USUARIO LOGUEADO)
  // loadPrivateWishlist() {
  //   this.loading = true;

  //   this.wishlistService.getWishlist().subscribe({
  //     next: data => {
  //       this.wishlist = data.map(item => ({
  //         id: item.gameId,
  //         name: item.gameName,
  //         backgroundImage: item.backgroundImage ?? '',
  //         rating: item.rating
  //       }));
  //       this.loading = false;
  //     },
  //     error: () => {
  //       this.error = 'Error loading wishlist';
  //       this.loading = false;
  //     }
  //   });
  // }

  // // PUBLIC WISHLIST
  // loadPublicWishlist(userId: number) {
  //   this.loading = true;

  //   this.wishlistService.getWishlistByUser(userId).subscribe({
  //     next: data => {
  //       this.wishlist = data.map(item => ({
  //         id: item.gameId,
  //         name: item.gameName,
  //         backgroundImage: item.backgroundImage ?? '',
  //         rating: item.rating
  //       }));
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       console.log('Error real del backend:', err);
  //       this.error = 'Error loading public wishlist';
  //       this.loading = false;
  //     }
  //   });
  // }

  loadPrivateWishlist() {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: data => this.afterLoad(this.mapGames(data)),
      error: () => { this.error = 'Error loading wishlist'; this.loading = false; }
    });
  }

  loadPublicWishlist(userId: number) {
    this.loading = true;
    this.wishlistService.getWishlistByUser(userId).subscribe({
      next: data => this.afterLoad(this.mapGames(data)),
      error: () => { this.error = 'Error loading public wishlist'; this.loading = false; }
    });
  }

  onFiltersChanged(filters: GameFilters) {
    this.wishlist = this.allGames.filter(game => {
      if (filters.genre && !game.genres?.includes(filters.genre)) return false;
      if (filters.platform && !game.platforms?.includes(filters.platform)) return false;
      if (game.rating != null) {
        if (game.rating < filters.ratingMin || game.rating > filters.ratingMax) return false;
      }
      if (game.released) {
        const year = new Date(game.released).getFullYear();
        if (year < filters.yearMin || year > filters.yearMax) return false;
      }
      return true;
    });
  }


  // REMOVE (solo si es wishlist propia)
  // removeFromWishlist(game: any) {
  //   if (this.visitedUserId) return;

  //   this.wishlistService.removeFromWishlist(game.gameId).subscribe({
  //     next: () => {
  //       this.wishlist = this.wishlist.filter(g => g.gameId !== game.gameId);
  //     },
  //     error: (err) => console.error(err)
  //   });
  // }

  removeFromWishlist(game: any) {
    if (this.visitedUserId) return;
    this.wishlistService.removeFromWishlist(game.id).subscribe({
      next: () => {
        this.allGames = this.allGames.filter(g => g.id !== game.id);
        this.wishlist = this.wishlist.filter(g => g.id !== game.id);
        this.buildFilterOptions(this.allGames);
      },
      error: (err) => console.error(err)
    });
  }

  trackById(index: number, game: any) {
    return game.gameId;
  }
}
