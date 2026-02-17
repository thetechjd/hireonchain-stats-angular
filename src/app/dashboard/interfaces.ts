export interface ChartDataPoint {
    key?: string;
    bucket?: string;
    value: number;
  }
  
  export interface TimeseriesDataPoint {
    bucket: string;
    count: number;
  }
  
  export interface TopJob {
    jobId: string;
    companyName: string;
    jobTitle: string;
    count: number;
  }
  
  export type Interval = 'hour' | 'day' | 'week' | 'month';
  
  export type ChartGroupBy =
    | 'time'
    | 'company'
    | 'jobTitle'
    | 'source'
    | 'jobLocation'
    | 'sponsored'
    | 'native';
  
  export interface ChartFilters {
    from?: string;
    to?: string;
    year?: number;
    interval?: Interval;
    companyName?: string;
    jobId?: string;
    jobTitle?: string;
    source?: string;
    jobLocation?: string;
    sponsored?: boolean;
    native?: boolean;
    tagsAny?: string;
    salaryMin?: number;
    salaryMax?: number;
    limit?: number;
  }
  
  export interface DatePreset {
    label: string;
    days?: number;
    ytd?: boolean;
    all?: boolean;
  }
  
  export interface ChartColors {
    primary: string;
    success: string;
    warning: string;
    danger: string;
    purple: string;
    cyan: string;
    gradient: string[];
  }
  
  export interface LoadingState {
    timeseries: boolean;
    company: boolean;
    jobTitle: boolean;
    source: boolean;
    location: boolean;
    sponsored: boolean;
    native: boolean;
    topJobs: boolean;
  }
  
  export interface SalaryRange {
    min: number;
    max: number;
    step: number;
  }

  export interface VisitStats{
    total:number;
    countries :{countryCode:string,count:number}[]
  }