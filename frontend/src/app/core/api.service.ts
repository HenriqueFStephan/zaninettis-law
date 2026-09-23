import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { I18nService } from './i18n';
import {
  BlogPost,
  ContactPayload,
  ContactResponse,
  ConsultingRequestPayload,
  ConsultingRequestResponse,
  NewsArticle,
  ServiceOffering,
  StudioIssuePayload,
  StudioIssueResponse,
  StudioStatusResponse,
  StudioUnlockResponse,
} from './models';

/**
 * HTTP client for the Zaninettis FastAPI backend.
 * All endpoints are versioned under /api/v1.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private i18n: I18nService,
  ) {}

  getNews(region?: string): Observable<NewsArticle[]> {
    let params = this.langParams();
    if (region) {
      params = params.set('region', region);
    }
    return this.http.get<NewsArticle[]>(`${this.base}/news`, { params });
  }

  getBlogPosts(tag?: string): Observable<BlogPost[]> {
    let params = this.langParams();
    if (tag) {
      params = params.set('tag', tag);
    }
    return this.http.get<BlogPost[]>(`${this.base}/blog`, { params });
  }

  getBlogBySlug(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.base}/blog/slug/${slug}`, {
      params: this.langParams(),
    });
  }

  getServices(): Observable<ServiceOffering[]> {
    return this.http.get<ServiceOffering[]>(`${this.base}/services`, {
      params: this.langParams(),
    });
  }

  submitContact(payload: ContactPayload): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.base}/contact`, payload, {
      params: this.langParams(),
    });
  }

  submitConsultingRequest(
    payload: ConsultingRequestPayload,
  ): Observable<ConsultingRequestResponse> {
    return this.http.post<ConsultingRequestResponse>(
      `${this.base}/services/consulting-request`,
      payload,
      { params: this.langParams() },
    );
  }

  getStudioStatus(): Observable<StudioStatusResponse> {
    return this.http.get<StudioStatusResponse>(`${this.base}/studio/status`);
  }

  unlockStudio(token: string): Observable<StudioUnlockResponse> {
    return this.http.post<StudioUnlockResponse>(`${this.base}/studio/unlock`, {}, {
      headers: this.studioHeaders(token),
    });
  }

  submitStudioIssue(token: string, payload: StudioIssuePayload): Observable<StudioIssueResponse> {
    return this.http.post<StudioIssueResponse>(`${this.base}/studio/issues`, payload, {
      headers: this.studioHeaders(token),
    });
  }

  private studioHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ 'X-Studio-Token': token });
  }

  private langParams(): HttpParams {
    return new HttpParams().set('lang', this.i18n.lang());
  }
}
