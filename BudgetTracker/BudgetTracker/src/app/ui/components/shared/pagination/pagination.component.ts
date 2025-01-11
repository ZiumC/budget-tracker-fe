import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnInit {
  protected page: number;
  protected pageSize: number;

  ngOnInit(): void {
    this.page = 1;
    this.pageSize = 12;
  }

  protected previous(): void {
    this.page--;
  }

  protected next(): void {
    this.page++;
  }
}
