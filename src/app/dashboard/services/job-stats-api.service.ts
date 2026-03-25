import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { 
  ChartDataPoint, 
  TopJob, 
  ChartFilters, 
  VisitStats
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class JobStatsApiService {
  private readonly apiUrl = 'https://api.hireonchain.io/stats'; // Change this to your API URL 'http://localhost:6443/stats'//
  private readonly timeout = 30000;

  constructor(private http: HttpClient) {}

  getChartData(
    groupBy: string,
    filters: ChartFilters = {}
  ): Observable<ChartDataPoint[]> {
    const params = this.buildHttpParams({ ...filters, groupBy });
    
    return this.http
      .get<ChartDataPoint[]>(`${this.apiUrl}/chart`, { params })
      .pipe(
        timeout(this.timeout),
        retry(2),
        catchError(this.handleError)
      );
  }

  getTimeseriesData(filters: ChartFilters = {}): Observable<ChartDataPoint[]> {
    return this.getChartData('time', filters);
  }

  getCompanyData(filters: ChartFilters = {}): Observable<ChartDataPoint[]> {
    return this.getChartData('company', filters);
  }

  getViewsData(filters: ChartFilters = {}): Observable<ChartDataPoint[]> {
    return this.getChartData('views', filters);
  }

  getJobTitleData(filters: ChartFilters = {}): Observable<ChartDataPoint[]> {
    return this.getChartData('jobTitle', filters);
  }

  getSourceData(filters: ChartFilters = {}): Observable<ChartDataPoint[]> {
    return this.getChartData('source', filters);
  }

  getLocationData(filters: ChartFilters = {}): Observable<ChartDataPoint[]> {
    return this.getChartData('jobLocation', filters);
  }

  getSponsoredData(filters: ChartFilters = {}): Observable<ChartDataPoint[]> {
    return this.getChartData('sponsored', filters);
  }

  getNativeData(filters: ChartFilters = {}): Observable<ChartDataPoint[]> {
    return this.getChartData('native', filters);
  }

  getTopJobs(filters: Partial<ChartFilters> = {}): Observable<TopJob[]> {
    const params = this.buildHttpParams(filters);
    
    return this.http
      .get<TopJob[]>(`${this.apiUrl}/top-jobs`, { params })
      .pipe(
        timeout(this.timeout),
        retry(2),
        catchError(this.handleError)
      );
  }

  private buildHttpParams(filters: any): HttpParams {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    
    return params;
  }

  getVisitsStats() {
    return this.http.get<VisitStats>(`https://api.hireonchain.io/visits/stats`);
  }

  getViewsStats() {
    return this.http.get<VisitStats>(`${this.apiUrl}/views/total`);
  }

  getUsersCount(){
    return this.http.get<any>(`https://api.hireonchain.io/user/count`)
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}