import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Status } from '../enum/status.enum';
import { CustomResponse } from '../interface/custom-response';
import { Book } from '../interface/book';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly apiUrl = 'http://localhost:8080';
  constructor(private http: HttpClient) {}

  books$ = <Observable<CustomResponse>>(
    this.http
      .get<CustomResponse>(`${this.apiUrl}/book/list`)
      .pipe(tap(console.log), catchError(this.handleError))
  );

  save$ = (book: Book) =>
    <Observable<CustomResponse>>(
      this.http
        .post<CustomResponse>(`${this.apiUrl}/book/save`, book)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  delete$ = (bookId: number) =>
    <Observable<CustomResponse>>(
      this.http
        .delete<CustomResponse>(`${this.apiUrl}/book/delete/${bookId}`)
        .pipe(tap(console.log), catchError(this.handleError))
    );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(() => `An error occured - Error code: ${error.status}`);
  }
}
