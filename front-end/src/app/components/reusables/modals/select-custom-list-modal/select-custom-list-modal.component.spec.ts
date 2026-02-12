import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCustomListModalComponent } from './select-custom-list-modal.component';

describe('SelectCustomListModalComponent', () => {
  let component: SelectCustomListModalComponent;
  let fixture: ComponentFixture<SelectCustomListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCustomListModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectCustomListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
