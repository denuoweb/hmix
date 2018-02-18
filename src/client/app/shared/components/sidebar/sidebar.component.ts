import { Component } from '@angular/core';
import { FileService } from '../../services/file/file.service';

@Component({
  moduleId: module.id,
  selector: 'sd-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.css']
})
export class SidebarComponent {
  private tabs = [{
    id: '0',
    name: 'File Explorer'
  }];
  private selectedTab = this.tabs[0];

  constructor(private fileService: FileService) { }
}
  