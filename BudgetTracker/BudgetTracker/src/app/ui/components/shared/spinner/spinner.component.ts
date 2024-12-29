import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})

export class SpinnerComponent {
  @Input() size: SpinnerSize = SpinnerSize.SMALL;
  protected readonly SpinnerSize = SpinnerSize;
}

export enum SpinnerSize {
  SMALL, MEDIUM, BIG
}
