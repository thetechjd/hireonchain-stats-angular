import { Component, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChartDataPoint {
  key?: string;
  value: number;
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],  // Add this!
  template: `
    <div class="pie-chart-container">
      <canvas #chartCanvas></canvas>
      <div class="legend">
        <div class="legend-item" *ngFor="let item of legendItems; let i = index">
          <div class="legend-color" [style.background]="item.color"></div>
          <div class="legend-text">
            <div class="legend-label">{{ item.label }}</div>
            <div class="legend-value">{{ item.value }} ({{ item.percentage }}%)</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pie-chart-container {
      width: 100%;
      height: 100%;
      min-height: 250px;
      display: flex;
      gap: 2rem;
      align-items: center;
    }
    
    canvas {
      flex-shrink: 0;
    }

    .legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 250px;
      overflow-y: auto;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .legend-text {
      flex: 1;
      min-width: 0;
    }

    .legend-label {
      font-size: 0.875rem;
      color: #fff;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .legend-value {
      font-size: 0.75rem;
      color: #888;
    }
  `]
})
export class PieChartComponent implements OnChanges {
  @Input() data: ChartDataPoint[] = [];
  @Input() colors: string[] = ['#0070f3', '#7928ca', '#ff0080', '#50e3c2', '#f5a623'];
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  legendItems: Array<{ label: string; value: number; percentage: number; color: string }> = [];

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
      label: d.key || `Item ${i + 1}`,
      value: d.value,
      percentage: Math.round((d.value / total) * 100),
      color: this.colors[i % this.colors.length]
    }));

    const size = 200;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    let currentAngle = -Math.PI / 2;

    this.data.forEach((d, i) => {
      const sliceAngle = (d.value / total) * Math.PI * 2;
      const color = this.colors[i % this.colors.length];

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}
