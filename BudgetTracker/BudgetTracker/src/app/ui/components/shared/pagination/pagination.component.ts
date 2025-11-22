import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnInit {
  @Input() name: string;
  @Input() pageCount: number;
  @Input() displayPageSize: boolean;
  @Input() pageSizeOptions: number[];
  @Input() disableFully: boolean;
  @Output() pageSizeEvent = new EventEmitter<number>();
  @Output() pageEvent = new EventEmitter<number>();
  @Output() initPageSizeEvent = new EventEmitter<number>;
  @Output() initPageEvent = new EventEmitter<number>;
  protected page: number;
  protected pageSize: number;
  protected disablePrevious: boolean;
  protected disableNext: boolean;
  protected isInvalidRange: boolean;
  private pageSizeName: string;
  private pageName: string;


  ngOnInit(): void {
    if (!this.pageCount) {
      throw new Error('Page count is not provided');
    }

    if (!this.name) {
      throw new Error('Name is not provided');
    }

    this.pageSizeName = this.name + "-pageSize";
    this.pageName = this.name + "-page";

    if (this.displayPageSize && this.pageSizeOptions == undefined) {
      throw new Error('Page size options are not provided');
    } else if (this.pageSizeOptions != undefined) {
      this.pageSize = this.pageSizeOptions[this.getPageSizeIndex()];
    }

    if (!this.disableFully) {
      this.disableFully = false;
    }

    this.page = this.getPage();
    this.disablePrevious = this.page <= 1;
    this.disableNext = this.page == this.pageCount;
    this.disableFully = this.disablePrevious && this.disableNext;
  }

  protected onPageChanged(): void {
    this.isInvalidRange = this.page < 1 || this.page > this.pageCount;
    if (!this.isInvalidRange) {
      localStorage.setItem(this.pageName, this.page.toString());
      localStorage.setItem(this.pageSizeName, this.pageSize.toString());
      this.pageEvent.emit(this.page);
    }
  }

  protected previous(): void {
    this.page--;
    if (this.page <= 1) {
      this.disablePrevious = true;
    }

    if (this.page < this.pageCount) {
      this.disableNext = false;
    }

    this.onPageChanged();
  }

  protected next(): void {
    this.page++;
    if (this.page > 1) {
      this.disablePrevious = false;
    }

    if (this.page >= this.pageCount) {
      this.disableNext = true;
    }

    this.onPageChanged();
  }

  protected onPageSizeChange(): void {
    localStorage.setItem(this.pageName, '1');
    localStorage.setItem(this.pageSizeName, this.pageSize.toString());
    this.pageSizeEvent.emit(this.pageSize);
  }

  private getPageSizeIndex(): number {
    const loadedPageSize = localStorage.getItem(this.pageSizeName);
    return loadedPageSize ? this.pageSizeOptions
      .findIndex(x => x === +loadedPageSize) : 0;
  }

  private getPage(): number {
    const loadedPage = localStorage.getItem(this.pageName);
    return loadedPage ? +loadedPage : 1;
  }
}
