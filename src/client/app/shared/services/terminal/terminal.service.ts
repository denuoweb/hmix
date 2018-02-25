import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class TerminalService {
  onTerminalOpenRequest: EventEmitter<void> = new EventEmitter<void>();

  openTerminal(): void {
    this.onTerminalOpenRequest.emit();
  }
}
