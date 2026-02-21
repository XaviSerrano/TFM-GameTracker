import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomListService } from '../../../../services/custom-list.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { CustomList, CustomListGame } from '../../../../models/custom-list.model';
import { GameCardComponent } from '../../../reusables/game-card/game-card.component';
import { GameCard } from '../../../../models/game-card.model';

interface GameCardData {
  gameId: number;
  name: string;
  background_image: string;
  isBookmarked: boolean;
}


@Component({
  selector: 'app-custom-list-detail',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './custom-list-detail.component.html',
  styleUrls: ['./custom-list-detail.component.css']
})
export class CustomListDetailComponent implements OnInit {

  list?: CustomList;
  listGames: GameCard[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private customListService: CustomListService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    // Cargar wishlist para marcar los juegos ya guardados
    this.wishlistService.getWishlist().subscribe({
      next: wishlist => {
        const wishlistIds = wishlist.map(g => g.gameId);

        this.customListService.getListById(id).subscribe(list => {
          this.list = list;

          this.listGames = (list.games || []).map((game: CustomListGame) => ({
            id: game.gameId,
            name: game.name,
            backgroundImage: game.backgroundImage ?? '',
            rating: game.rating ?? null
          }));

          this.loading = false;
        });
      },
      error: () => {
        this.customListService.getListById(id).subscribe(list => {
          this.list = list;

          this.listGames = (list.games || []).map((game: CustomListGame) => ({
            id: game.gameId,
            name: game.name,
            backgroundImage: game.backgroundImage ?? '',
            rating: game.rating ?? null
          }));

          this.loading = false;
        });
      }
    });
  }

  trackById(index: number, game: GameCardData) {
    return game.gameId;
  }
}
