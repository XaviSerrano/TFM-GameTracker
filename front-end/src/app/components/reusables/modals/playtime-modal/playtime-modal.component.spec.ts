import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaytimeModalComponent } from './playtime-modal.component';

describe('PlaytimeModalComponent', () => {
  let component: PlaytimeModalComponent;
  let fixture: ComponentFixture<PlaytimeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaytimeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaytimeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
