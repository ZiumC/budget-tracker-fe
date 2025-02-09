import {BehaviorSubject, Observable, timer} from "rxjs";

export class TimerUtils {
  private isFinished: BehaviorSubject<boolean>;
  private duration: number;

  constructor(duration: number) {
    this.duration = duration;
    this.isFinished = new BehaviorSubject(false);
  }

  start(): Observable<boolean> {
    timer(this.duration).subscribe(v => {
      if (v == 0) {
        this.isFinished.next(true);
      }
    });

    return this.isFinished.asObservable();
  }
}
