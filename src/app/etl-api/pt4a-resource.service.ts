import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { DataCacheService } from '../shared/services/data-cache.service';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class Pt4aService {
  constructor(
    protected http: HttpClient,
    protected appSettingsService: AppSettingsService,
    private cacheService: DataCacheService
  ) {}

  private getUrl(name: string): string {
    return this.appSettingsService.getEtlRestbaseurl().trim() + name;
  }

  public get url(): string {
    return this.appSettingsService.getEtlRestbaseurl().trim();
  }

  public getPeerPatients(uuid: string) {
    console.log('PEER METHOD REACHED');
    const urlParams: HttpParams = new HttpParams().set('creatorUuid', uuid);

    const url = this.getUrl('cmd-peer');
    const request = this.http
      .get<any>(url, {
        params: urlParams
      })
      .pipe(
        map((response: any) => {
          return response.result;
        })
      );
    console.log('PEER PATIENTS EXECUTED');
    return this.cacheService.cacheRequest(url, urlParams, request);
  }

  //   public getPeerPatients(uuid: string): Observable<any> {
  //     console.log('GET PEER PATIENTS REACHED');
  //     return this.http.get(`${this.url}pt4a?creatorUuid=${uuid}`).pipe(
  //       catchError((err: any) => {
  //         const error: any = err;
  //         const errorObj = {
  //           error: error.status,
  //           message: error.statusText
  //         };
  //         return Observable.of(errorObj);
  //       }),
  //       map((response: Response) => {
  //         console.log('PEER PATIENTS EXECUTED');
  //         return response;
  //       })
  //     );
  //   }
}
