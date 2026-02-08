import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { JobStatsApiService } from './services/job-stats-api.service';
import { LineChartComponent } from './charts/line-chart.component';
import { BarChartComponent } from './charts/bar-chart.component';
import { PieChartComponent } from './charts/pie-chart.component';
import { DonutChartComponent } from './charts/donut-chart.component';
import { 
  ChartDataPoint, 
  TimeseriesDataPoint, 
  TopJob, 
  ChartFilters,
  DatePreset,
  LoadingState,
  SalaryRange,
  ChartColors
} from './interfaces';

@Component({
  selector: 'app-job-stats-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LineChartComponent,
    BarChartComponent,
    PieChartComponent,
    DonutChartComponent
  ],
  providers: [JobStatsApiService],
  templateUrl: './job-stats-dashboard.component.html',
  styleUrls: ['./job-stats-dashboard.component.css']
})
export class JobStatsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentYear = new Date().getFullYear();
  
  timeseriesData: TimeseriesDataPoint[] = [];
  companyData: ChartDataPoint[] = [];
  jobTitleData: ChartDataPoint[] = [];
  sourceData: ChartDataPoint[] = [];
  locationData: ChartDataPoint[] = [];
  sponsoredData: ChartDataPoint[] = [];
  nativeData: ChartDataPoint[] = [];
  topJobs: TopJob[] = [];
  
  loading: LoadingState = {
    timeseries: false,
    company: false,
    jobTitle: false,
    source: false,
    location: false,
    sponsored: false,
    native: false,
    topJobs: false
  };
  
  filters: ChartFilters = {
    interval: 'day',
    limit: 10
  };
  
  datePresets: DatePreset[] = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Year to date', ytd: true },
    { label: 'All time', all: true }
  ];
  
  private filterChanged = new Subject<void>();
  
  salaryRange: SalaryRange = {
    min: 0,
    max: 500000,
    step: 5000
  };
  
  chartColors: ChartColors = {
    primary: '#0070f3',
    success: '#0070f3',
    warning: '#f5a623',
    danger: '#ff0080',
    purple: '#7928ca',
    cyan: '#50e3c2',
    gradient: ['#0070f3', '#7928ca', '#ff0080']
  };

  constructor(private apiService: JobStatsApiService) {}

  ngOnInit(): void {
    this.setupFilterDebounce();
    this.setDatePreset(30);
    this.loadAllCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterDebounce(): void {
    this.filterChanged
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadAllCharts();
      });
  }

  loadAllCharts(): void {
    this.loadTimeseriesChart();
    this.loadCompanyChart();
    this.loadJobTitleChart();
    this.loadSourceChart();
    this.loadLocationChart();
    this.loadSponsoredChart();
    this.loadNativeChart();
    this.loadTopJobs();
  }

  loadTimeseriesChart(): void {
    this.loading.timeseries = true;
    
    this.apiService
      .getTimeseriesData(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.timeseriesData = data.map(d => ({
            bucket: d.bucket!,
            count: d.value
          }));
          this.loading.timeseries = false;
        },
        error: () => {
          this.timeseriesData = [];
          this.loading.timeseries = false;
        }
      });
  }

  loadCompanyChart(): void {
    this.loading.company = true;
    this.apiService.getCompanyData(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.companyData = data;
          this.loading.company = false;
        },
        error: () => {
          this.companyData = [];
          this.loading.company = false;
        }
      });
  }

  loadJobTitleChart(): void {
    this.loading.jobTitle = true;
    this.apiService.getJobTitleData(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.jobTitleData = data;
          this.loading.jobTitle = false;
        },
        error: () => {
          this.jobTitleData = [];
          this.loading.jobTitle = false;
        }
      });
  }

  loadSourceChart(): void {
    this.loading.source = true;
    this.apiService.getSourceData(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.sourceData = data;
          this.loading.source = false;
        },
        error: () => {
          this.sourceData = [];
          this.loading.source = false;
        }
      });
  }

  loadLocationChart(): void {
    this.loading.location = true;
    this.apiService.getLocationData(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.locationData = data;
          this.loading.location = false;
        },
        error: () => {
          this.locationData = [];
          this.loading.location = false;
        }
      });
  }

  loadSponsoredChart(): void {
    this.loading.sponsored = true;
    this.apiService.getSponsoredData(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.sponsoredData = data;
          this.loading.sponsored = false;
        },
        error: () => {
          this.sponsoredData = [];
          this.loading.sponsored = false;
        }
      });
  }

  loadNativeChart(): void {
    this.loading.native = true;
    this.apiService.getNativeData(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.nativeData = data;
          this.loading.native = false;
        },
        error: () => {
          this.nativeData = [];
          this.loading.native = false;
        }
      });
  }

  loadTopJobs(): void {
    this.loading.topJobs = true;
    this.apiService.getTopJobs(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topJobs = data;
          this.loading.topJobs = false;
        },
        error: () => {
          this.topJobs = [];
          this.loading.topJobs = false;
        }
      });
  }

  onFilterChange(): void {
    this.filterChanged.next();
  }

  setDatePreset(days?: number, ytd?: boolean, all?: boolean): void {
    if (all) {
      this.filters.from = undefined;
      this.filters.to = undefined;
      this.filters.year = undefined;
    } else if (ytd) {
      this.filters.year = new Date().getFullYear();
      this.filters.from = undefined;
      this.filters.to = undefined;
    } else if (days) {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - days);
      
      this.filters.from = from.toISOString().split('T')[0];
      this.filters.to = to.toISOString().split('T')[0];
      this.filters.year = undefined;
    }
    
    this.loadAllCharts();
  }

  clearFilters(): void {
    this.filters = {
      interval: 'day',
      limit: 10
    };
    this.loadAllCharts();
  }

  onSalaryMinChange(value: number): void {
    this.filters.salaryMin = value === 0 ? undefined : value;
    this.onFilterChange();
  }

  onSalaryMaxChange(value: number): void {
    this.filters.salaryMax = value === this.salaryRange.max ? undefined : value;
    this.onFilterChange();
  }

  formatSalary(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTotalApplications(): number {
    return this.timeseriesData.reduce((sum, d) => sum + d.count, 0);
  }
}