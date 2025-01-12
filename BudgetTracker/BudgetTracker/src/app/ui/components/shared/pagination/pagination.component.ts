import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnInit {
  @Input() lastPage: number;
  protected page: number;
  protected disablePrevious: boolean;
  protected disableNext: boolean;


  ngOnInit(): void {
    this.page = 1;

    if (this.page == this.lastPage) {
      this.disableNext = true;
    } else {
      this.disableNext = false;
    }

    this.disablePrevious = true;

    if (!this.lastPage){
      this.disableNext = true;
      this.disablePrevious = true;
    }
  }

  protected previous(): void {
    this.page--;

    if (this.page <= 1) {
      this.disablePrevious = true;
    }

    if (this.page < this.lastPage) {
      this.disableNext = false;
    }
  }

  protected next(): void {
    this.page++;

    if (this.page > 1) {
      this.disablePrevious = false;
    }

    if (this.page >= this.lastPage) {
      this.disableNext = true;
    }
  }
}
