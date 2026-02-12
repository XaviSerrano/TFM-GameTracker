import { Component, Input, OnInit } from '@angular/core';
import { FollowService } from '../../../services/follow.service';
@Component({
  selector: 'app-followers-list',
  standalone: true,
  imports: [],
  templateUrl: './followers-list.component.html',
  styleUrls: ['./followers-list.component.css']
})
export class FollowersListComponent implements OnInit {

  @Input() userId!: number;

  followers: any[] = [];
  loading = true;

  constructor(private followService: FollowService) {}

  ngOnInit() {
    this.followService.getFollowers(this.userId).subscribe({
      next: list => {
        this.followers = list;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
