import {
  Component,
  OnInit,
  HostListener,
  ElementRef
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthModalComponent } from '../../auth/auth-modal/auth-modal.component';
import { AuthService, User } from '../../services/auth.service';
import { RawgService, NormalizedGame } from '../../services/rawg.service'; // ✅ Importa NormalizedGame
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthModalComponent, RouterLink],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  query = '';
  searchResults: (NormalizedGame | any)[] = []; // ✅ Tipo más específico
  searchingUsers = false;
  showSuggestions = false;

  private searchSubject = new Subject<string>();

  showAuthModal = false;
  isDropdownOpen = false;

  readonly fallbackAvatar = 'assets/images/icons/profile.svg';

  constructor(
    private router: Router,
    public auth: AuthService,
    private rawgService: RawgService,
    private userService: UserService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(query => {
        const trimmed = query.trim();
        if (!trimmed) return of({ results: [] }); // ✅ Retorna estructura consistente

        if (trimmed.startsWith('@')) {
          this.searchingUsers = true;
          // Envuelve el resultado de usuarios en una estructura similar
          return this.userService.searchUsers(trimmed.slice(1)).pipe(
            switchMap(users => of({ results: users }))
          );
        } else {
          this.searchingUsers = false;
          return this.rawgService.getGamesByName(trimmed);
        }
      })
    ).subscribe(response => {
      // ✅ Ahora siempre accede a .results
      this.searchResults = response.results?.slice(0, 5) || [];
      this.showSuggestions = this.searchResults.length > 0;
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.query);
  }

  search() {
    const trimmed = this.query.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('@')) {
      this.router.navigate(['/users/search', trimmed.slice(1)]);
    } else {
      this.router.navigate(['/search', trimmed]);
    }

    this.resetSearch();
  }

  selectItem(item: any) {
    this.router.navigate(
      this.searchingUsers
        ? ['/user', item.username]
        : ['/detail', item.id]
    );
    this.resetSearch();
  }

  resetSearch() {
    this.query = '';
    this.searchResults = [];
    this.showSuggestions = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  toggleAuthModal() {
    this.showAuthModal = !this.showAuthModal;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const dropdown = this.elementRef.nativeElement.querySelector('.dropdown');
    const searchBar = this.elementRef.nativeElement.querySelector('.search-bar');

    if (this.isDropdownOpen && !dropdown?.contains(event.target)) {
      this.isDropdownOpen = false;
    }

    if (this.showSuggestions && !searchBar?.contains(event.target)) {
      this.showSuggestions = false;
    }
  }

  onAvatarError(user: User) {
    if (user) {
      this.auth.updateCurrentUser({ profileImage: null });
    }
  }
}