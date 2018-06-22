import { Injectable, EventEmitter } from '@angular/core';
import { ITab } from '../../models/tab.model';

// component creates ITab for all tabs
// handles their information and active status
// any new tabs should be added here

@Injectable()
export class TabService {
  onActiveTabChange: EventEmitter<void> = new EventEmitter<void>();
  private _tabs: ITab[] = [
    {
      name: 'file',
      displayName: 'File Explorer',
      icon: 'fa-folder-open',
      active: true
    },
    {
      name: 'compile',
      displayName: 'Compile',
      icon: 'fa-bug',
      active: false
    },
    {
      name: 'run',
      displayName: 'Run',
      icon: 'fa-play',
      active: false
    },
    {
      name: 'help',
      displayName: 'Help',
      icon: 'fa-question-circle',
      active: false
    }
  ];

  get tabs(): ITab[] {
    return this._tabs;
  }
  // return current tab
  get activeTab(): ITab {
    return this._tabs.find((tab) => {
      return tab.active;
    });
  }
  // make selected tab active, deactivate other tabs
  set activeTab(tab: ITab) {
    this.tabs.forEach((t) => {
      t.active = false;
    });
    tab.active = true;
    this.onActiveTabChange.emit();
  }
}
