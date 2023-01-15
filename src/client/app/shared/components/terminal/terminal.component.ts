import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Services
import { TerminalService, HtmlcoinService } from '../../services/index';

@Component({
  moduleId: module.id,
  selector: 'sd-terminal',
  templateUrl: 'terminal.component.html',
  styleUrls: ['terminal.component.css']
})
export class TerminalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('logContainer') private logContainer: ElementRef;
  private _terminalOpenSub: Subscription;
  private _terminalCommand: string;
  private _commandHistory: string[] = [''];
  private _historyIndex = 0;

  constructor(private terminalService: TerminalService,
              private htmlcoinService: HtmlcoinService) { }


  /*
   * Lifecycle hooks
   */

  ngAfterViewInit() {
    // Scroll to the bottom whenever the terminal is updated
    this._terminalOpenSub = this.terminalService.onTerminalOpenRequest.subscribe(() => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 25);
    });
  }

  ngOnDestroy() {
    // Stop all subscriptions to avoid memory leaks
    this._terminalOpenSub.unsubscribe();
  }


  /*
   * Public functions
   */

  /**
   * Loads a command from either up or down in the history
   * @param {number} direction
   */
  loadCommandFromHistory(direction: number): void {
    // Store the current command at the current index
    this._commandHistory[this._historyIndex] = this._terminalCommand;

    // Move the index in the given direction
    this._historyIndex += direction;

    if (this._historyIndex < 0) {
      this._historyIndex = 0;
    } else if (this._historyIndex >= this._commandHistory.length) {
      this._historyIndex = this._commandHistory.length - 1;
    }

    // Load the stored command
    this._terminalCommand = this._commandHistory[this._historyIndex];
  }

  /**
   * Executes the current terminal command
   */
  handleCommand(): void {
    // Don't do anything if the command is an empty string
    if (this._terminalCommand.trim() === '') {
      return;
    }

    // Insert the current command into the history and reset the index
    this._commandHistory.splice(1, 0, this._terminalCommand);
    this._historyIndex = 0;

    // Split the terminal input into the actual command and its arguments
    const splitCommand = this._terminalCommand.split(' ');
    const command = splitCommand[0];

    // Slice off the arguments
    const args: string[] = splitCommand.length > 1 ? splitCommand.slice(1) : [];

    if (command === 'clear') {
      this.terminalService.clear();
    } else {
      this.htmlcoinService.rpc.rawCall(command, args).then((result: any) => {
        // Stringify the result on the transaction calls
        // log them
        result = result instanceof Object ? JSON.stringify(result, null, '\t') : result;
        this.terminalService.log(result);
      }).catch((err: any) => {
        console.log(err);
        this.terminalService.log(err);
      });
    }

    this._terminalCommand = '';
  }


  /*
   * Private functions
   */

  private scrollToBottom(): void {
    this.logContainer.nativeElement.scrollTop = this.logContainer.nativeElement.scrollHeight;
  }


  /*
   * Public getters/setters
   */

  get logs(): string[] {
    return this.terminalService.logs;
  }

  get terminalCommand(): string {
    return this._terminalCommand;
  }

  set terminalCommand(command: string) {
    this._terminalCommand = command;
  }
}
