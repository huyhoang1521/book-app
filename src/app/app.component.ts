import { Component, OnInit } from '@angular/core';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { DataState } from './enum/data.state.enum';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { BookService } from './service/book.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  appState$: Observable<AppState<CustomResponse>>;
  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.appState$ = this.bookService.books$.pipe(
      map((response) => {
        return { dataState: DataState.LOADED_STATE, appData: response };
      }),
      startWith({ dataState: DataState.LOADING_STATE }),
      catchError((error: string) => {
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }
}
