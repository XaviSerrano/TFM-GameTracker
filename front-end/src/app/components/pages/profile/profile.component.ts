import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { FollowService } from '../../../services/follow.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RatingsChartComponent } from '../../reusables/modals/ratings-chart/ratings-chart.component';
import { ReviewsSummaryComponent } from '../../reusables/reviews-summary/reviews-summary.component';
import { WishlistService } from '../../../services/wishlist.service';
import { UserGameService } from '../../../services/user-game.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RatingsChartComponent, ReviewsSummaryComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile: any = {};
  loading = true;

  isFollowing = false;

  wishlistCount = 0;
  collectionCount = 0;

  followers: any[] = [];
  following: any[] = [];

  loadingFollowers = false;
  loadingFollowing = false;

  showFollowersModal = false;
  showFollowingModal = false;

  isOwnProfile = true;
  routeUsername: string | null = null;

  selectedTab: 'ratings' | 'reviews' = 'ratings';
  placeholderImage = 'assets/images/icons/profile.svg'; // Placeholder fijo

  ratingCounts: {1:number,2:number,3:number,4:number,5:number} = {1:0,2:0,3:0,4:0,5:0};

  visitedUserId!: number;

  constructor(
    private userService: UserService,
    private followService: FollowService,
    private route: ActivatedRoute,
    private router: Router,
    private wishlistService: WishlistService,
    private userGameService: UserGameService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.routeUsername = params.get('username');

      if (this.routeUsername) {
        this.isOwnProfile = false;
        this.loadPublicProfile(this.routeUsername);
      } else {
        this.isOwnProfile = true;
        this.loadProfile();
      }
    });
  }

  // UTILIDAD PARA IMÁGENES
  private setProfileImage(user: any) {
    return {
      ...user,
      profileImage: user.profileImage || this.placeholderImage
    };
  }

  // PERFIL
  loadProfile() {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: user => {
        this.profile = this.setProfileImage(user);
        this.visitedUserId = user.id; // ¡IMPORTANTE!
        console.log('✅ Perfil propio - User ID:', this.visitedUserId);
        
        this.loadUserRatings(user.id);
        this.loadWishlistCount();
        this.loadCollectionCount();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.loading = false;
      }
    });
  }

  loadPublicProfile(username: string) {
    this.loading = true;
    this.userService.getUserByUsername(username).subscribe({
      next: user => {
        this.profile = this.setProfileImage(user);
        this.visitedUserId = user.id; // ¡IMPORTANTE!
        console.log('✅ Perfil público - User ID:', this.visitedUserId, 'Username:', username);
        
        this.loadUserRatings(user.id);
        this.loadPublicWishlistCount(user.id);
        this.loadPublicCollectionCount(user.id);

        this.followService.isFollowing(user.id).subscribe({
          next: res => { 
            this.isFollowing = res.following; 
            this.loading = false; 
          },
          error: () => { 
            this.isFollowing = false; 
            this.loading = false; 
          }
        });
      },
      error: (err) => {
        console.error('Error cargando perfil público:', err);
        this.loading = false;
      }
    });
  }

  // FOLLOWERS / FOLLOWING
  openFollowers() {
    this.loadingFollowers = true;
    this.showFollowersModal = true;

    this.followService.getFollowers(this.profile.id).subscribe({
      next: list => {
        this.followers = list.map(u => this.setProfileImage(u));
        this.loadingFollowers = false;
      },
      error: (err) => {
        console.log(err);
        this.loadingFollowers = false;
      }
    });
  }

  openFollowing() {
    this.loadingFollowing = true;
    this.showFollowingModal = true;

    this.followService.getFollowing(this.profile.id).subscribe({
      next: list => {
        this.following = list.map(u => this.setProfileImage(u));
        this.loadingFollowing = false;
      },
      error: () => this.loadingFollowing = false
    });
  }

  closeModal() {
    this.showFollowersModal = false;
    this.showFollowingModal = false;
  }

  toggleFollow() {
    if (!this.isFollowing) {
      this.followService.followUser(this.profile.id).subscribe({
        next: () => {
          this.isFollowing = true;
          this.profile.followersCount = (this.profile.followersCount || 0) + 1;
          this.alertService.show('USER_FOLLOWED');
        }
      });
    } else {
      this.followService.unfollowUser(this.profile.id).subscribe({
        next: () => {
          this.isFollowing = false;
          this.profile.followersCount = Math.max(0, (this.profile.followersCount || 1) - 1);
          this.alertService.show('USER_UNFOLLOWED');
        }
      });
    }
  }


  goToUser(username: string) {
    this.closeModal();
    this.router.navigate(['/user', username]);
  }

  // RATINGS
  loadUserRatings(userId: number) {
    this.userService.getUserRatings(userId).subscribe({ 
      next: (games: any[]) => {
        const counts: Record<1|2|3|4|5, number> = {1:0,2:0,3:0,4:0,5:0};
        games.forEach(g => { const r = Number(g.rating) as 1|2|3|4|5; if(r>=1&&r<=5) counts[r]++; });
        this.ratingCounts = counts;
      }
    });
  }

  selectTab(tab: 'ratings' | 'reviews') {
    this.selectedTab = tab;
  }

  // WISHLIST / COLLECTION
  goToWishlist() {
    if (this.isOwnProfile) this.router.navigate(['/wishlist']);
    else this.router.navigate(['/wishlist'], { queryParams: { userId: this.visitedUserId } });
  }

  goToCollection() {
    if (this.isOwnProfile) this.router.navigate(['/collection']);
    else this.router.navigate(['/collection'], { queryParams: { userId: this.visitedUserId } });
  }

  loadWishlistCount() {
    this.wishlistService.getWishlist().subscribe({ next: items => this.wishlistCount = items.length });
  }

  loadPublicWishlistCount(userId: number) {
    this.wishlistService.getWishlistByUser(userId).subscribe({ next: items => this.wishlistCount = items.length });
  }

  loadCollectionCount() {
    const statuses = ["Playing", "Played", "Completed", "Abandoned"];
    let total = 0;
    statuses.forEach(status => {
      this.userGameService.getGamesByStatus(status).subscribe({ next: games => { total += games.length; this.collectionCount = total; }});
    });
  }

  loadPublicCollectionCount(userId: number) {
    const statuses = ["Playing", "Played", "Completed", "Abandoned"];
    let total = 0;
    statuses.forEach(status => {
      this.userGameService.getUserGamesByStatus(userId, status).subscribe({ next: games => { total += games.length; this.collectionCount = total; }});
    });
  }

}
