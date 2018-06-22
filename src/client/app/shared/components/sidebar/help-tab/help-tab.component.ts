import { Component } from '@angular/core';

// Constants
import { HELP_COMMANDS } from '../../../constants/index';

// help commands contains tesnet url change that if new one is needed

@Component({
  moduleId: module.id,
  selector: 'sd-help-tab',
  templateUrl: 'help-tab.component.html',
  styleUrls: ['help-tab.component.css']
})
export class HelpTabComponent {
  private _helpCommands = HELP_COMMANDS;

  get helpCommands(): any {
    return this._helpCommands;
  }
}
