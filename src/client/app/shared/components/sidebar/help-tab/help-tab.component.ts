import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'sd-help-tab',
  templateUrl: 'help-tab.component.html',
  styleUrls: ['help-tab.component.css']
})
export class HelpTabComponent {
  private helpCommands = {
    'docker': '$ docker run -it --rm \\ \n' +
              '    --name myapp \\ \n' +
              '    -v \`pwd\`:/dapp \\ \n' +
              '    -p 9899:9899 \\ \n' +
              '    -p 9888:9888 \\ \n' +
              '    -p 3889:3889 \\ \n' +
              '    hayeah/qtumportal',
    'generateInitial': '$ docker exec -it myapp sh \n' +
                       '$ qcli generate 600',
    'generateOne': '$ qcli generate 1'
  };
}
