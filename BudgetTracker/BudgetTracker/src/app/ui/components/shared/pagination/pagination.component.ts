import {Component, Input, OnInit} from '@angular/core';

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
  protected page: number;
  protected pageSize: number;
  protected disablePrevious: boolean;
  protected disableNext: boolean;


  ngOnInit(): void {
    this.page = 1;

    this.disableNext = this.page == this.pageCount;
    this.disablePrevious = true;

    if (!this.pageCount) {
      throw new Error('Page count is not provided');
    }

    if (this.displayPageSize && this.pageSizeOptions == undefined) {
      throw new Error('Page size options are not provided');
    } else if (this.pageSizeOptions != undefined) {
      this.pageSize = this.pageSizeOptions[0];
    }

    if (!this.disableFully){
      this.disableFully = false;
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
  }

  protected next(): void {
    this.page++;

    if (this.page > 1) {
      this.disablePrevious = false;
    }

    if (this.page >= this.pageCount) {
      this.disableNext = true;
    }
  }
}
