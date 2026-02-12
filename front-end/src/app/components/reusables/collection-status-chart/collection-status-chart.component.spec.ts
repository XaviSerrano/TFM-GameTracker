import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionStatusChartComponent } from './collection-status-chart.component';

describe('CollectionStatusChartComponent', () => {
  let component: CollectionStatusChartComponent;
  let fixture: ComponentFixture<CollectionStatusChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionStatusChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionStatusChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
