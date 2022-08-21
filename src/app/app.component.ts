import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  startWith,
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
  toggle = true;
  status = 'Enable';
  page = 0;

  constructor(
    private bookService: BookService,
    private notifier: NotificationService
  ) {}
  ngOnInit(): void {
    this.appState$ = this.bookService.books$(this.page).pipe(
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

  calculatePageRange(curr: number, totalPages: number) {
    let nextVal = null;
    let pages = [];
    let formattedPages = [];

    // minimum pages to show for the first/last range
    let outer = 3;
    // minimum pages to wrap around the middle range
    let wrap = 2;

    // Range of left and right page counts
    for (let i = 1; i <= totalPages; i++) {
      if (
        i <= outer ||
        i > totalPages - outer ||
        (i >= curr - wrap && i <= curr + wrap)
      ) {
        pages.push(i);
      }
    }

    // Add dots to the range
    for (let i = 0; i < pages.length; i++) {
      if (nextVal && nextVal !== pages[i] - 1) {
        formattedPages.push('...');
      }
      formattedPages.push(pages[i]);
      nextVal = pages[i];
    }

    console.log(totalPages);
    return formattedPages;
  }

  nextPage(page: number) {
    this.page = page - 1;
    this.getCurrentPage();
  }

  getCurrentPage() {
    this.appState$ = this.bookService.books$(this.page).pipe(
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
    this.appState$ = this.bookService.save$(bookForm.value as Book).pipe(
      map((response) => {
        // const oldBooks = [];
        // if (this.appState.appData?.data.books) {
        //   oldBooks.push(...this.appState.appData.data.books);
        // }
        // this.dataSubject.next({
        //   ...response,
        //   data: {
        //     books: [response.data.book, ...oldBooks].sort(),
        //   },
        // });

        this.getCurrentPage();
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
        // this.dataSubject.next({
        //   ...response,
        //   data: {
        //     books: this.dataSubject.value.data.books.filter(
        //       (s) => s.id !== book.id
        //     ),
        //   },
        // });

        this.getCurrentPage();
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
