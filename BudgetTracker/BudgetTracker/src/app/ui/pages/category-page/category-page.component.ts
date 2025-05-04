import {Component, OnDestroy, OnInit} from '@angular/core';
import {CategoryType} from "../../../models/dto/category.model.dto";

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
    }
    ngOnInit(): void {
    }

  protected readonly CategoryType = CategoryType;
}
