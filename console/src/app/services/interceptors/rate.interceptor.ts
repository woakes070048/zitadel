import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, filter, map, mergeMap, Observable, retryWhen, throwError, timer } from 'rxjs';
import { WarnDialogComponent } from 'src/app/modules/warn-dialog/warn-dialog.component';

interface RetryParams {
  maxAttempts?: number;
  scalingDuration?: number;
  shouldRetry?: ({ status: number }) => boolean;
}

@Injectable({ providedIn: 'root' })
export class RateInterceptor implements HttpInterceptor {
  defaultParams: RetryParams = {
    maxAttempts: 3,
    scalingDuration: 1000,
    shouldRetry: ({ status }) => status >= 400,
  };

  constructor(private dialog: MatDialog) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { shouldRetry } = this;
    return next.handle(req).pipe(
      retryWhen(
        this.genericRetryStrategy({
          shouldRetry,
        }),
      ),
    );
  }

  private genericRetryStrategy =
    (params: RetryParams = {}) =>
    (attempts: Observable<any>) =>
      attempts.pipe(
        mergeMap((error, i) => {
          const { maxAttempts, scalingDuration, shouldRetry } = { ...defaultParams, ...params };
          const retryAttempt = i + 1;
          // if maximum number of retries have been met
          // or response is a status code we don't wish to retry, throw error
          if (retryAttempt > maxAttempts || !shouldRetry(error)) {
            return throwError(error);
          }
          console.log(`Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`);
          // retry after 1s, 2s, etc...
          return timer(retryAttempt * scalingDuration);
        }),
      );

  private shouldRetry = (error) => error.status === 429;

  //   private handleError(error: HttpErrorResponse) {
  //     console.log(error, error.status);
  //     if (error.status === 429) {
  //       // A client-side or network error occurred. Handle it accordingly.
  //       console.error('An error occurred:', error.error);
  //       const dialogRef = this.dialog.open(WarnDialogComponent, {
  //         data: {},
  //         width: '400px',
  //       });

  //       dialogRef.afterClosed().subscribe((resp) => {
  //         if (resp) {
  //         }
  //       });
  //     }
  //     // Return an observable with a user-facing error message.
  //     return throwError(() => new Error('Something bad happened; please try again later.'));
  //   }
}
