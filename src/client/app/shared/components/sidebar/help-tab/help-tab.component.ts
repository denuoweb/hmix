import { Component } from '@angular/core';

// Constants
import { HELP_COMMANDS } from '../../../constants/index';

@Component({
  moduleId: module.id,
  selector: 'sd-help-tab',
  templateUrl: 'help-tab.component.html',
  styleUrls: ['help-tab.component.css']
})
export class HelpTabComponent {
<<<<<<< HEAD
  private helpCommands = {
    'docker': '$ docker run -it --rm --name myapp -v `pwd`:/dapp -p 9899:9899 -p 9888:9888 -p 3889:3889 spacemanholdings/qtum-portal-dev',
    'generateInitial': '$ docker exec -it myapp sh \n' +
                       '$ qcli generate 600',
    'generateOne': '$ qcli generate 1'
  };
=======
  private _helpCommands = HELP_COMMANDS;

  get helpCommands(): any {
    return this._helpCommands;
  }
>>>>>>> 48505cc3cccd49aa5d4df245d85602d87f541fd8
}
