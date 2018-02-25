import { Component } from '@angular/core';

// Services
import { TerminalService } from '../../services/terminal/terminal.service';

@Component({
  moduleId: module.id,
  selector: 'sd-terminal',
  templateUrl: 'terminal.component.html',
  styleUrls: ['terminal.component.css']
})
export class TerminalComponent {
  constructor(private terminalService: TerminalService) { }
}
