import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-playtime-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playtime-modal.component.html',
  styleUrl: './playtime-modal.component.css',
})
export class PlaytimeModalComponent {
  @Input() showPlaytime = false;
  @Input() initialPlaytime = 0;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<number>();

  playtime = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showPlaytime'] && this.showPlaytime) {
      this.playtime = this.initialPlaytime ?? 0;
    }
  }

  constructor(private alertService: AlertService) {}

  setPlaytime(value: number) {
    this.playtime = value;
  }

  onConfirm() {
    this.save.emit(this.playtime);
    this.alertService.show('GAME_STATUS_SET');
    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }
}
