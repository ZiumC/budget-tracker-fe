import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {interval, Subscription, takeWhile} from "rxjs";

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css'
})
export class TimerComponent implements OnInit, OnDestroy {
  @Output() timerFinishedEvent = new EventEmitter<boolean>();
  protected readonly maxTime = 25;
  protected timeLeft: number;
  protected disableTimer: boolean;
  private subscription: Subscription;

  ngOnInit(): void {
    this.default();
    this.start();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  default(): void {
    this.disableTimer = false;
    this.timeLeft = this.maxTime;
  }

  disable(): void {
    this.disableTimer = true;
  }

  private start(): void {
    this.subscription = (interval(100)
      .pipe(takeWhile((): boolean => this.timeLeft > 0))
      .subscribe((): void => {
        this.timeLeft--;
        if (this.disableTimer) {
          this.timeLeft = 0;
        }
        if (this.timeLeft == 0) {
          this.timerFinishedEvent.emit(true);
        }
      }));
  }
}
