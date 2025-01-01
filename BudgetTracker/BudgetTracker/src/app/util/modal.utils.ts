import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';

export class ModalOptions {

  static default(ms?: ModalSize): NgbModalOptions {
    let size: string;
    switch (ms) {
      case ModalSize.SMALL:
        size = 'sm';
        break;
      case ModalSize.MEDIUM:
        size = 'md';
        break;
      case ModalSize.BIG:
        size = 'lg';
        break;
      default:
        size = 'md';
        break;
    }

    return {
      centered: true,
      scrollable: true,
      size: size,
      backdrop: 'static',
      keyboard: false,
    } as NgbModalOptions;
  }
}

export enum ModalSize {
  SMALL,
  MEDIUM,
  BIG,
}
