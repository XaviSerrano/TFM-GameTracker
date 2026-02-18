import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleChanges } from '@angular/core';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-game-status-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-status-modal.component.html',
  styleUrl: './game-status-modal.component.css'
})
export class GameStatusModalComponent {
  @Input() show = false;
  @Input() currentStatus: string | null = null;
  @Input() game: any = null;

  @Output() close = new EventEmitter<void>();
  @Output() selectStatus = new EventEmitter<string | null>();

  pendingStatus: string | null = null;

  statuses = [
    { key: 'Playing', label: 'Playing' },
    { key: 'Played', label: 'Played' },
    { key: 'Completed', label: 'Completed 100%' },
    { key: 'Abandoned', label: 'Abandoned' },
  ];


  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && this.show) {
      this.pendingStatus = this.currentStatus;
    }
  }

  onSelect(status: string, event: MouseEvent) {
    event.stopPropagation();
    this.pendingStatus = status;
  }

  onSubmit(event: MouseEvent) {
    event.stopPropagation();
    if (this.pendingStatus) {
      this.selectStatus.emit(this.pendingStatus);
      this.currentStatus = this.pendingStatus;
    }
    this.close.emit();
  }
  
  onClear(event: MouseEvent) {
    event.stopPropagation();
    this.pendingStatus = null;
    this.selectStatus.emit(null);
    this.currentStatus = null;
    this.close.emit();
  }


  onBackdropClick(event: MouseEvent) {
    this.close.emit();
  }

  onCloseClick(event: MouseEvent) {
    event.stopPropagation();
    this.close.emit();
  }
}
