import { Component, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';

interface ChartDataPoint {
  key?: string;
  value: number;
}

@Component({
  standalone: true,
  selector: 'app-bar-chart',
  template: `
    <div class="bar-chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .bar-chart-container {
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
export class BarChartComponent implements OnChanges {
  @Input() data: ChartDataPoint[] = [];
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

    // Set canvas size
    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    ctx.scale(dpr, dpr);

    // Chart dimensions
    const padding = { top: 20, right: 20, bottom: 80, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Get data range
    const maxValue = Math.max(...this.data.map(d => d.value));

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw grid lines
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

    // Draw Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const value = maxValue - (maxValue / gridLines) * i;
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.fillText(Math.round(value).toString(), padding.left - 10, y);
    }

    // Calculate bar dimensions
    const barWidth = chartWidth / this.data.length;
    const barSpacing = barWidth * 0.2;
    const actualBarWidth = barWidth - barSpacing;

    // Draw bars
    this.data.forEach((d, i) => {
      const x = padding.left + barWidth * i + barSpacing / 2;
      const barHeight = (d.value / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, this.color + '80');

      // Draw bar
      ctx.fillStyle = gradient;
      this.roundRect(ctx, x, y, actualBarWidth, barHeight, 4);
      ctx.fill();

      // Draw value on top
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(d.value.toString(), x + actualBarWidth / 2, y - 5);
    });

    // Draw X-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.save();

    this.data.forEach((d, i) => {
      const x = padding.left + barWidth * i + barSpacing / 2 + actualBarWidth / 2;
      const y = padding.top + chartHeight + 10;
      
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      
      const label = this.truncateLabel(d.key || '', 20);
      ctx.fillText(label, 0, 0);
      
      ctx.rotate(Math.PI / 4);
      ctx.translate(-x, -y);
    });

    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private truncateLabel(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
