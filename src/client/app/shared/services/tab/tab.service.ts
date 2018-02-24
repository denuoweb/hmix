import { Injectable, EventEmitter } from '@angular/core';
import { ITab } from '../../models/tab.model';

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
      name: 'settings',
      displayName: 'Settings',
      icon: 'fa-cog',
      active: false
    }
  ];

  get tabs(): ITab[] {
    return this._tabs;
  }

  get activeTab(): ITab {
    return this._tabs.find((tab) => {
      return tab.active;
    });
  }

  set activeTab(tab: ITab) {
    this.tabs.forEach((tab) => {
      tab.active = false;
    });
    tab.active = true;
    this.onActiveTabChange.emit();
  }
}
