import { Sort } from './sort';

export interface Page {
  //   sort: [];
  //   offset: number;
  //   pageNumber: number;
  //   pageSize: number;
  //   paged: boolean;
  //   unpaged: boolean;

  // content: ,
  pageable: string;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
