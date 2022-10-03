import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,

} from '@angular/common/http';

import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const customReq = request.clone({});
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {

            // auto logout if 401 response returned from api
            localStorage.removeItem('userToken');
            //this.router.navigate(['/login']);
            location.reload();
          }
          //  console.log(error)

          // server error
          return throwError(error)
        } else {
          // client side error
          return throwError(error)

        }
      })
    );
  }
}
