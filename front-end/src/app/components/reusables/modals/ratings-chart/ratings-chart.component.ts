import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
Chart.register(...registerables);

@Component({
  selector: 'app-ratings-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ratings-chart.component.html',
  styleUrls: ['./ratings-chart.component.css']
})
export class RatingsChartComponent implements OnChanges {

  @Input() counts!: { 1: number, 2: number, 3: number, 4: number, 5: number };

  private chart!: Chart;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['counts'] && this.counts) {
      this.renderChart();
    }
  }

  renderChart() {
    const canvas = document.getElementById('ratingsChartCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['1 ⭐', '2 ⭐', '3 ⭐', '4 ⭐', '5 ⭐'],
        datasets: [{
          label: 'Ratings count',
          data: [
            this.counts[1],
            this.counts[2],
            this.counts[3],
            this.counts[4],
            this.counts[5]
          ],
          backgroundColor: ['#06829d'],
          hoverBackgroundColor: ['#05647a'],
        }]
      },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                color: '#ffffff'
              },
              grid: {
                display: false
              },
              border: {
                display: true,
                color: '#ffffff'
              }
            },
            x: {
              ticks: {
                color: '#ffffff'
              },
              grid: {
                display: false
              },
              border: {
                display: true,
                color: '#ffffff'
              }
            }
          }
        }

    });
  }
}
