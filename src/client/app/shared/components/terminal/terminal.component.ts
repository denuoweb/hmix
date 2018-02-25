import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Services
import { TerminalService } from '../../services/terminal/terminal.service';

@Component({
  moduleId: module.id,
  selector: 'sd-terminal',
  templateUrl: 'terminal.component.html',
  styleUrls: ['terminal.component.css']
})
export class TerminalComponent implements AfterViewInit {
  @ViewChild('logContainer') private logContainer: ElementRef;
  private terminalOpenSub: Subscription;

  constructor(private terminalService: TerminalService) { }

  ngAfterViewInit() {
    this.terminalOpenSub = this.terminalService.onTerminalOpenRequest.subscribe(() => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 25);
    });
  }

  private scrollToBottom() {
    this.logContainer.nativeElement.scrollTop = this.logContainer.nativeElement.scrollHeight;
  }

  get logs(): string[] {
    return this.terminalService.logs;
  }
}
