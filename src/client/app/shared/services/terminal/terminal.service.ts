import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class TerminalService {
  onTerminalOpenRequest: EventEmitter<void> = new EventEmitter<void>();
  private _logs: string[] = [];

  openTerminal(): void {
    this.onTerminalOpenRequest.emit();
  }

  clear(): void {
    this._logs = [];
  }

  log(status: string): void {
    this.openTerminal();
    this._logs.push(status);
  }

  get logs(): string[] {
    return this._logs;
  }
}
