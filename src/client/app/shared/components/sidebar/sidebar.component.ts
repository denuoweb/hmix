import { Component } from '@angular/core';
import { TabService } from '../../services/tab/tab.service';
import { FileService } from '../../services/file/file.service';

@Component({
  moduleId: module.id,
  selector: 'sd-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.css']
})
export class SidebarComponent {
  constructor(private fileService: FileService,
              private tabService: TabService) { }
            
  activeTabNameIs(tabName: string): boolean {
    return this.tabService.activeTab.name === tabName;
  }
}
  