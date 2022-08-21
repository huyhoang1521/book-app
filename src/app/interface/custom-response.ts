import { Book } from './book';
import { Page } from './page';

export interface CustomResponse {
  timeStamp: Date;
  statusCode: number;
  status: string;
  reason: string;
  message: string;
  developerMessage: string;
  data: {
    books?: Book[];
    book?: Book;
  };
  page?: Page;
}
