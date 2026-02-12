import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.css']
})
export class RatingModalComponent {
  @Input() showRating = false;
  @Input() initialRating = 0;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<number>();

  rating = 0;
  hover = 0;

  ngOnChanges() {
    if (this.initialRating != null) {
      this.rating = this.initialRating;
    }
  }
  
  setHover(value: number) {
    this.hover = value;
  }

  clearHover() {
    this.hover = 0;
  }

  selectRating(value: number) {
    this.rating = value;
  }

  onConfirm() {
    this.save.emit(this.rating);
    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    event.stopPropagation();
    this.close.emit();
  }
}
