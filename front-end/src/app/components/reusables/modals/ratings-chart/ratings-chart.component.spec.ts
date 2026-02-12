import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingsChartComponent } from './ratings-chart.component';

describe('RatingsChartComponent', () => {
  let component: RatingsChartComponent;
  let fixture: ComponentFixture<RatingsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatingsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
