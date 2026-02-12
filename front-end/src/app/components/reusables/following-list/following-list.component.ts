import { Component, Input, OnInit } from '@angular/core';
import { FollowService } from '../../../services/follow.service';

@Component({
  selector: 'app-following-list',
  standalone: true,
  imports: [],
  templateUrl: './following-list.component.html',
  styleUrls: ['./following-list.component.css']
})
export class FollowingListComponent implements OnInit {

  @Input() userId!: number;

  following: any[] = [];
  loading = true;

  constructor(private followService: FollowService) {}

  ngOnInit() {
    this.followService.getFollowing(this.userId).subscribe({
      next: list => {
        this.following = list;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
