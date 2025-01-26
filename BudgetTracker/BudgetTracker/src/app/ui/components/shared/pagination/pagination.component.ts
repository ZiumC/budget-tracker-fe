import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnInit {
  @Input() pageCount: number;
  @Input() displayPageSize: boolean;
  @Input() pageSizeOptions: number[];
  @Input() disableFully: boolean;
  @Output() emitNextPageEvent = new EventEmitter<boolean>();
  @Output() emitPreviousPageEvent = new EventEmitter<boolean>();
  protected page: number;
  protected pageSize: number;
  protected disablePrevious: boolean;
  protected disableNext: boolean;
  protected invalidRange: boolean;


  ngOnInit(): void {
    this.page = 1;
    this.disablePrevious = true;

    if (!this.pageCount) {
      throw new Error('Page count is not provided');
    }

    if (this.displayPageSize && this.pageSizeOptions == undefined) {
      throw new Error('Page size options are not provided');
    } else if (this.pageSizeOptions != undefined) {
      this.pageSize = this.pageSizeOptions[0];
    }

    if (!this.disableFully) {
      this.disableFully = false;
    }
  }

  protected validateRange(): void {
    this.invalidRange = this.page < 1 || this.page > this.pageCount;
  }

  protected previous(): void {
    this.page--;
    if (this.page <= 1) {
      this.disablePrevious = true;
    }

    if (this.page < this.pageCount) {
      this.disableNext = false;
    }

    this.validateRange();
    this.emitPreviousPageEvent.emit(!this.invalidRange);
  }

  protected next(): void {
    this.page++;
    if (this.page > 1) {
      this.disablePrevious = false;
    }

    if (this.page >= this.pageCount) {
      this.disableNext = true;
    }
    
    this.validateRange();
    this.emitNextPageEvent.emit(!this.invalidRange);
  }
}
