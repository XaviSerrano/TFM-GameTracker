import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CustomListService } from '../../../../services/custom-list.service';
import { ModalManagerService } from '../../../../services/modal-manager.service';
import { CustomList } from '../../../../models/custom-list.model';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-select-custom-list-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-custom-list-modal.component.html',
  styleUrls: ['./select-custom-list-modal.component.css']
})
export class SelectCustomListModalComponent implements OnChanges {

  @Input() show = false;
  @Input() game!: any;

  lists: CustomList[] = [];
  selectedListIds = new Set<number>();
  initialListIds = new Set<number>();

  constructor(
    private customListService: CustomListService,
    public modalManager: ModalManagerService,
    private alertService: AlertService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['game'] && this.game) {
      this.loadLists();
    }
  }

  private loadLists() {
    this.selectedListIds.clear();
    this.initialListIds.clear();

    this.customListService.getMyLists().subscribe(lists => {
      this.lists = lists;

      lists.forEach(list => {
        if (list.games?.some(g => g.gameId === this.game.id)) {
          this.selectedListIds.add(list.id);
          this.initialListIds.add(list.id);
        }
      });
    });
  }

  toggleList(listId: number) {
    this.selectedListIds.has(listId)
      ? this.selectedListIds.delete(listId)
      : this.selectedListIds.add(listId);
  }

  save() {
    const addedLists: number[] = [];
    const removedLists: number[] = [];

    const requests = this.lists
      .filter(list => {
        const wasSelected = this.initialListIds.has(list.id);
        const isSelected = this.selectedListIds.has(list.id);

        if (!wasSelected && isSelected) addedLists.push(list.id);
        if (wasSelected && !isSelected) removedLists.push(list.id);

        return wasSelected !== isSelected;
      })
      .map(list =>
        this.customListService.toggleGameInList(list.id, {
          id: this.game.id,
          name: this.game.name,
          backgroundImage: this.game.backgroundImage
        })
      );

    if (requests.length === 0) {
      this.modalManager.closeCustomListModal();
      return;
    }

    forkJoin(requests).subscribe(() => {
      this.modalManager.closeCustomListModal();

      if (addedLists.length > 0) {
        this.alertService.show('GAME_ADDED_TO_LIST');
      }
      if (removedLists.length > 0) {
        this.alertService.show('GAME_REMOVED_FROM_LIST');
      }
    });
  }
}
