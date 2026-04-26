import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomListModalComponent } from './custom-list-modal/custom-list-modal.component';
import { CustomListService } from '../../../services/custom-list.service';
import { CustomList } from '../../../models/custom-list.model';
import { Router, RouterLink } from '@angular/router';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-custom-lists',
  standalone: true,
  imports: [CommonModule, CustomListModalComponent, RouterLink],
  templateUrl: './custom-lists.component.html',
  styleUrls: ['./custom-lists.component.css']
})
export class CustomListsComponent implements OnInit {
  showCreateModal = false;
  showDeleteModal = false;
  lists: CustomList[] = [];
  listToEdit?: CustomList;
  listToDelete?: { id: number; title: string };

  constructor(
    private customListService: CustomListService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadLists();
  }

  loadLists() {
    this.customListService.getMyLists().subscribe(lists => {
      this.lists = lists;
    });
  }

  openModal() {
    this.showCreateModal = true;
  }

  closeModal() {
    this.showCreateModal = false;
    this.listToEdit = undefined;
  }

  openDeleteModal(list: CustomList, event: MouseEvent) {
    event.stopPropagation();
    this.listToDelete = { id: list.id, title: list.title };
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.listToDelete = undefined;
  }

  confirmDelete() {
    if (!this.listToDelete) return;

    this.customListService.deleteList(this.listToDelete.id).subscribe({
      next: () => {
        this.lists = this.lists.filter(list => list.id !== this.listToDelete!.id);
        this.alertService.show('CUSTOM_LIST_DELETED');
        this.closeDeleteModal();
      },
      error: err => {
        console.error(err);
        this.closeDeleteModal();
      }
    });
  }

  onCreateList(data: { title: string; description: string }) {
    this.customListService.createList(data).subscribe(list => {
      this.lists = [...this.lists, list];
      this.closeModal();
    });
  }

  trackById(index: number, list: CustomList) {
    return list.id;
  }
  deleteList(listId: number, event: MouseEvent) {
    event.stopPropagation();
    const list = this.lists.find(l => l.id === listId);
    if (list) {
      this.openDeleteModal(list, event);
    }
  }

  editList(list: CustomList, event: MouseEvent) {
    event.stopPropagation();
    this.listToEdit = list;
    this.showCreateModal = true;
  }
  
  onUpdateList(data: { id: number; title: string; description: string }) {
    this.customListService.updateList(data.id, data).subscribe(updated => {
      this.lists = this.lists.map(list =>
        list.id === updated.id ? updated : list
      );
      this.closeModal();
    });
  }

  goToList(id: number) {
    this.router.navigate(['/custom-lists', id], { replaceUrl: true });
  }
}