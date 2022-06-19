import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  startWith,
  first,
  last,
} from 'rxjs';
import { DataState } from './enum/data.state.enum';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { BookService } from './service/book.service';
import { Book } from './interface/book';
import { NotificationService } from './service/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  appState$: Observable<AppState<CustomResponse>>;
  appState: AppState<CustomResponse>;
  readonly DataState = DataState;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  constructor(
    private bookService: BookService,
    private notifier: NotificationService
  ) {}
  ngOnInit(): void {
    this.appState$ = this.bookService.books$.pipe(
      map((response) => {
        this.appState = {
          dataState: DataState.LOADED_STATE,
          appData: response,
        };
        return this.appState;
      }),
      startWith({ dataState: DataState.LOADING_STATE }),
      catchError((error: string) => {
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }

  saveBook(bookForm: NgForm): void {
    this.isLoading.next(true);
    //console.log(bookForm.value as Book);
    //console.log(bookForm.value);
    this.appState$ = this.bookService.save$(bookForm.value as Book).pipe(
      map((response) => {
        const oldBooks = [];
        if (this.appState.appData?.data.books) {
          oldBooks.push(...this.appState.appData.data.books);
        }
        this.dataSubject.next({
          ...response,
          data: {
            books: [response.data.book, ...oldBooks].sort(),
          },
        });
        this.notifier.onDefault(response.message);
        document.getElementById('closeModal').click();
        this.isLoading.next(false);
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value,
        };
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value,
      }),
      catchError((error: string) => {
        this.isLoading.next(false);
        this.notifier.onError(error);
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }

  deleteBook(book: Book): void {
    this.appState$ = this.bookService.delete$(book.id).pipe(
      map((response) => {
        this.dataSubject.next({
          ...response,
          data: {
            books: this.dataSubject.value.data.books.filter(
              (s) => s.id !== book.id
            ),
          },
        });
        this.notifier.onDefault(response.message);
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value,
        };
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value,
      }),
      catchError((error: string) => {
        this.notifier.onError(error);
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }
}
