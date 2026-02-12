import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalManagerController } from './modal-manager.component';
describe('ModalManagerComponent', () => {
  let component: ModalManagerController;
  let fixture: ComponentFixture<ModalManagerController>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalManagerController]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalManagerController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
