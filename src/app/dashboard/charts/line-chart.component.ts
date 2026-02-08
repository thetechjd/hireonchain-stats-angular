import { Component, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';

interface TimeseriesDataPoint {
  bucket: string;
  count: number;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  template: `
    <div class="line-chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .line-chart-container {
      width: 100%;
      height: 100%;
      min-height: 250px;
      position: relative;
    }
    
    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class LineChartComponent implements OnChanges {
  @Input() data: TimeseriesDataPoint[] = [];
  @Input() color: string = '#0070f3';
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngOnChanges(): void {
    this.renderChart();
  }

  private renderChart(): void {
    if (!this.data || this.data.length === 0) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 50, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    const maxValue = Math.max(...this.data.map(d => d.count));
    const minValue = 0;

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const value = maxValue - (maxValue / gridLines) * i;
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.fillText(Math.round(value).toString(), padding.left - 10, y);
    }

    const points: { x: number; y: number }[] = this.data.map((d, i) => {
      const x = padding.left + (chartWidth / (this.data.length - 1)) * i;
      const ratio = (d.count - minValue) / (maxValue - minValue);
      const y = padding.top + chartHeight - ratio * chartHeight;
      return { x, y };
    });

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, this.color + '40');
    gradient.addColorStop(1, this.color + '00');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    });
    ctx.stroke();

    points.forEach(p => {
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const maxLabels = Math.min(8, this.data.length);
    const labelStep = Math.ceil(this.data.length / maxLabels);

    this.data.forEach((d, i) => {
      if (i % labelStep === 0 || i === this.data.length - 1) {
        const x = padding.left + (chartWidth / (this.data.length - 1)) * i;
        const label = this.formatDate(d.bucket);
        ctx.fillText(label, x, padding.top + chartHeight + 10);
      }
    });
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}