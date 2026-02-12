import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameStatusModalComponent } from './game-status-modal.component';

describe('GameStatusModalComponent', () => {
  let component: GameStatusModalComponent;
  let fixture: ComponentFixture<GameStatusModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameStatusModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameStatusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
