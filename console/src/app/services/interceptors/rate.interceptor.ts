import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, map, Observable, throwError } from 'rxjs';
import { WarnDialogComponent } from 'src/app/modules/warn-dialog/warn-dialog.component';

@Injectable({ providedIn: 'root' })
export class RateInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      //   filter((event) => event instanceof HttpResponse),
      map((req) => {
        console.log(req, typeof req);
        if ((req as HttpResponse<any>)?.status === 429) {
          this.handleError(req as HttpResponse<any>);
          throw new Error('Rate limit exceeded!');
        } else {
          return req;
        }
      }),
    );
  }

  private handleError(response: HttpResponse<any>): void {
    console.log(response);
    const dialogRef = this.dialog.open(WarnDialogComponent, {
      data: {},
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
      }
    });
  }
}
