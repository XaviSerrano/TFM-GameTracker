import { Component, Input, OnInit } from '@angular/core';
import { FollowService } from '../../../../services/follow.service';
@Component({
  selector: 'app-follow-button',
  standalone: true,
  imports: [],
  templateUrl: './follow-button.component.html',
  styleUrls: ['./follow-button.component.css']
})
export class FollowButtonComponent implements OnInit {

  @Input() userId!: number;

  loading = false;
  isFollowing = false;

  constructor(private followService: FollowService) {}

  ngOnInit() {
    this.checkFollowing();
  }

  checkFollowing() {
    this.followService.isFollowing(this.userId).subscribe(res => {
      this.isFollowing = res.following;
    });
  }

  toggleFollow() {
    this.loading = true;

    const req = this.isFollowing
      ? this.followService.unfollowUser(this.userId)
      : this.followService.followUser(this.userId);

    req.subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
