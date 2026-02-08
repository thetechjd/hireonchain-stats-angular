import { Component, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChartDataPoint {
  key?: string;
  value: number;
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],  // Add this!
  template: `
    <div class="donut-chart-container">
      <div class="donut-wrapper">
        <canvas #chartCanvas></canvas>
        <div class="donut-center">
          <div class="donut-percentage">{{ mainPercentage }}%</div>
          <div class="donut-label">{{ mainLabel }}</div>
        </div>
      </div>
      <div class="donut-legend">
        <div class="legend-item" *ngFor="let item of legendItems">
          <div class="legend-color" [style.background]="item.color"></div>
          <div class="legend-text">
            <div class="legend-label">{{ item.label }}</div>
            <div class="legend-value">{{ item.value | number }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .donut-chart-container {
      width: 100%;
      height: 100%;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
    }
    
    .donut-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    canvas {
      display: block;
    }

    .donut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .donut-percentage {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #0070f3, #7928ca);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .donut-label {
      font-size: 0.75rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .donut-legend {
      display: flex;
      gap: 1.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      flex-shrink: 0;
    }

    .legend-text {
      display: flex;
      flex-direction: column;
    }

    .legend-label {
      font-size: 0.75rem;
      color: #888;
      text-transform: capitalize;
    }

    .legend-value {
      font-size: 0.875rem;
      color: #fff;
      font-weight: 600;
    }
  `]
})
export class DonutChartComponent implements OnChanges {
  @Input() data: ChartDataPoint[] = [];
  @Input() colors: string[] = ['#0070f3', '#666'];
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  legendItems: Array<{ label: string; value: number; color: string }> = [];
  mainPercentage: number = 0;
  mainLabel: string = '';

  ngOnChanges(): void {
    this.renderChart();
  }

  private renderChart(): void {
    if (!this.data || this.data.length === 0) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const total = this.data.reduce((sum, d) => sum + d.value, 0);

    this.legendItems = this.data.map((d, i) => ({
      label: this.formatLabel(d.key),
      value: d.value,
      color: this.colors[i % this.colors.length]
    }));

    if (this.data.length > 0) {
      this.mainPercentage = Math.round((this.data[0].value / total) * 100);
      this.mainLabel = this.formatLabel(this.data[0].key);
    }

    const size = 180;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 10;
    const innerRadius = outerRadius * 0.6;

    let currentAngle = -Math.PI / 2;

    this.data.forEach((d, i) => {
      const sliceAngle = (d.value / total) * Math.PI * 2;
      const color = this.colors[i % this.colors.length];

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });
  }

  private formatLabel(key: string | undefined): string {
    if (!key) return 'Unknown';
    
    if (key === 'true') return 'Yes';
    if (key === 'false') return 'No';
    
    return key.charAt(0).toUpperCase() + key.slice(1);
  }
}