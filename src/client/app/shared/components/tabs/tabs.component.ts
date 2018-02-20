import { Component } from '@angular/core';
import { ITab } from '../../models/tab.model';
import { TabService } from '../../services/tab/tab.service';

@Component({
  moduleId: module.id,
  selector: 'sd-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.css']
})
export class TabsComponent {
  constructor(private tabService: TabService) { }

  selectTab(tab: ITab) {
    this.tabService.activeTab = tab;
  }
}
