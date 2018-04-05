import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Services
import { TerminalService } from '../../services/terminal/terminal.service';
import { QtumService } from '../../services/qtum/qtum.service';

@Component({
  moduleId: module.id,
  selector: 'sd-terminal',
  templateUrl: 'terminal.component.html',
  styleUrls: ['terminal.component.css']
})
export class TerminalComponent implements AfterViewInit {
  @ViewChild('logContainer') private logContainer: ElementRef;
  private terminalOpenSub: Subscription;
  private terminalCommand: string;
  private commandHistory: string[] = [''];
  private historyIndex = 0;

  constructor(private terminalService: TerminalService,
              private qtumService: QtumService) { }

  ngAfterViewInit() {
    this.terminalOpenSub = this.terminalService.onTerminalOpenRequest.subscribe(() => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 25);
    });
  }

  loadFromHistory(direction: number): void {
    this.commandHistory[this.historyIndex] = this.terminalCommand;
    this.historyIndex += direction;

    if (this.historyIndex < 0) {
      this.historyIndex = 0;
    } else {
      if (this.historyIndex >= this.commandHistory.length) {
        this.historyIndex = this.commandHistory.length - 1;
      }
    }

    this.terminalCommand = this.commandHistory[this.historyIndex];
  }

  handleCommand(): void {
    if (this.terminalCommand.trim() === '') {
      return;
    }

    this.commandHistory.splice(1, 0, this.terminalCommand);
    this.historyIndex = 0;

    const splitCommand = this.terminalCommand.split(' ');
    const command = splitCommand[0];

    let args: string[] = [];
    if (splitCommand.length > 1) {
      args = splitCommand.slice(1);
    }

    if (command === 'clear') {
      this.terminalService.clear();
    } else {
      this.qtumService.rpc.rawCall(command, args).then((result: any) => {
        if (result instanceof Object) {
          result = JSON.stringify(result, null, '\t');
        }
        this.terminalService.log(result);
      }).catch((err: any) => {
        console.log(err);
        this.terminalService.log(err);
      });
    }

    this.terminalCommand = '';
  }

  private scrollToBottom(): void {
    this.logContainer.nativeElement.scrollTop = this.logContainer.nativeElement.scrollHeight;
  }

  get logs(): string[] {
    return this.terminalService.logs;
  }
}
