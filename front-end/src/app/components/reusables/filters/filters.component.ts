import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface GameFilters {
  genre: string | null;
  platform: string | null;
  ratingMin: number;
  ratingMax: number;
  yearMin: number;
  yearMax: number;
  searchTitle: string;
}


@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent implements OnInit, AfterViewInit {
  @Input() genres: string[] = [];
  @Input() platforms: string[] = [];
  
  @Output() filtersChanged = new EventEmitter<GameFilters>

  // Buscar título
  searchTitle = '';

  // Genre && Platform
  selectedGenre: string | null = null;
  selectedPlatform: string | null = null;

  // Rating range (0 - 5, step 0.5)
  readonly RATING_MIN = 0;
  readonly RATING_MAX = 5;
  readonly RATING_STEP = 0.5;

  // Valores variables
  ratingMin = 0;
  ratingMax = 5;
  
  // Year range
  readonly YEAR_MIN = 1980;
  readonly YEAR_MAX = new Date().getFullYear();

  // Valores variables
  yearMin = 1980;
  yearMax = new Date().getFullYear();

  activeFiltersCount = 0;

  @ViewChild('ratingTrack') ratingTrack!: ElementRef<HTMLDivElement>;
  @ViewChild('yearTrack') yearTrack!: ElementRef<HTMLDivElement>;



@ViewChild('ratingMinInput') ratingMinRef!: ElementRef<HTMLInputElement>;
@ViewChild('ratingMaxInput') ratingMaxRef!: ElementRef<HTMLInputElement>;
@ViewChild('yearMinInput') yearMinRef!: ElementRef<HTMLInputElement>;
@ViewChild('yearMaxInput') yearMaxRef!: ElementRef<HTMLInputElement>;

  ngOnInit() {}

  ngAfterViewInit() {
    this.updateTrackFill('rating');
    this.updateTrackFill('year');
  }

  // ── Rating handlers ──────────────────────────────────────────
  onRatingMinChange(value: number) {
    const clamped = Math.min(Number(value), this.ratingMax - this.RATING_STEP);
    this.ratingMin = clamped;
    this.ratingMinRef.nativeElement.value = String(clamped); // ← fuerza DOM
    this.updateTrackFill('rating');
    this.emit();
  }

  onRatingMaxChange(value: number) {
    const clamped = Math.max(Number(value), this.ratingMin + this.RATING_STEP);
    this.ratingMax = clamped;
    this.ratingMaxRef.nativeElement.value = String(clamped); // ← fuerza DOM
    this.updateTrackFill('rating');
    this.emit();
  }



  // ── Year handlers ─────────────────────────────────────────────
  onYearMinChange(value: number) {
    const clamped = Math.min(Number(value), this.yearMax - 1);
    this.yearMin = clamped;
    this.yearMinRef.nativeElement.value = String(clamped); // ← fuerza DOM
    this.updateTrackFill('year');
    this.emit();
  }

  onYearMaxChange(value: number) {
    const clamped = Math.max(Number(value), this.yearMin + 1);
    this.yearMax = clamped;
    this.yearMaxRef.nativeElement.value = String(clamped); // ← fuerza DOM
    this.updateTrackFill('year');
    this.emit();
  }

  // ── Track fill ────────────────────────────────────────────────
  updateTrackFill(type: 'rating' | 'year') {
    const trackRef = type === 'rating' ? this.ratingTrack : this.yearTrack;
    if (!trackRef?.nativeElement) return;

    const min = type === 'rating' ? this.RATING_MIN : this.YEAR_MIN;
    const max = type === 'rating' ? this.RATING_MAX : this.YEAR_MAX;
    const vMin = type === 'rating' ? this.ratingMin : this.yearMin;
    const vMax = type === 'rating' ? this.ratingMax : this.yearMax;

    const left = ((vMin - min) / (max - min)) * 100;
    const right = ((vMax - min) / (max - min)) * 100;

    trackRef.nativeElement.style.setProperty('--left', `${left}%`);
    trackRef.nativeElement.style.setProperty('--right', `${right}%`);
  }

  onFilterChange() {
    this.emit();
  }

  private emit() {
    this.updateActiveCount();
    this.filtersChanged.emit({
      genre: this.selectedGenre,
      platform: this.selectedPlatform,
      ratingMin: this.ratingMin,
      ratingMax: this.ratingMax,
      yearMin: this.yearMin,
      yearMax: this.yearMax,
      searchTitle: this.searchTitle,

    });
  }

  private updateActiveCount() {
    let count = 0;
    if (this.selectedGenre) count++;
    if (this.selectedPlatform) count++;
    if (this.ratingMin > this.RATING_MIN || this.ratingMax < this.RATING_MAX) count++;
    if (this.yearMin > this.YEAR_MIN || this.yearMax < this.YEAR_MAX) count++;
    if (this.searchTitle.trim()) count++;

    this.activeFiltersCount = count;
  }

  clearFilters() {
    this.selectedGenre = null;
    this.selectedPlatform = null;
    this.ratingMin = this.RATING_MIN;
    this.ratingMax = this.RATING_MAX;
    this.yearMin = this.YEAR_MIN;
    this.yearMax = this.YEAR_MAX;
    this.activeFiltersCount = 0;
    this.searchTitle = '';

    setTimeout(() => {
      this.updateTrackFill('rating');
      this.updateTrackFill('year');
    });
    this.filtersChanged.emit({
      genre: null,
      platform: null,
      ratingMin: this.RATING_MIN,
      ratingMax: this.RATING_MAX,
      yearMin: this.YEAR_MIN,
      yearMax: this.YEAR_MAX,
      searchTitle: this.searchTitle,  // ← añadir

    });
  }

}
