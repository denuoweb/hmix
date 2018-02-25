import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Services
import { TabService } from '../shared/services/tab/tab.service';
import { StorageService } from '../shared/services/storage/storage.service';
import { TerminalService } from '../shared/services/terminal/terminal.service';

// Constants
import { STORAGE_KEYS } from '../shared/constants/storage-keys';

@Component({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
})
export class HomeComponent implements OnInit {
  private tabsWidth = 50;
  private defaultSidebarWidth = 200;
  private defaultTerminalHeight = 0;
  private minSidebarWidth = 150;
  private minTerminalHeight = 100;
  private _terminalHeight: number;
  private _sidebarWidth: number;
  private resizingSidebar: boolean;
  private resizingTerminal: boolean;
  private lastX: number;
  private lastY: number;
  private tabChangeSubscription: Subscription;
  private terminalOpenSub: Subscription;

  constructor(private changeDetector: ChangeDetectorRef,
              private storageService: StorageService,
              private tabService: TabService,
              private terminalService: TerminalService) { }

  ngOnInit() {
    this.sidebarWidth = this.storageService.get(STORAGE_KEYS['sidebarWidth']) || this.defaultSidebarWidth;
    this.terminalHeight = this.defaultTerminalHeight;

    this.tabChangeSubscription = this.tabService.onActiveTabChange.subscribe(() => {
      if (this.sidebarWidth < this.minSidebarWidth) {
        this.sidebarWidth = this.defaultSidebarWidth;
      }
    });
    this.terminalOpenSub = this.terminalService.onTerminalOpenRequest.subscribe(() => {
      if (this.terminalHeight < this.minTerminalHeight) {
        this.terminalHeight = this.minTerminalHeight;
      }
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.resizingSidebar && !this.resizingTerminal) return;

    if (this.resizingSidebar) {
      const currentX = event.clientX;

      // Calculate a new width
      if (currentX > this.minSidebarWidth) {
        const newWidth = this.sidebarWidth + currentX - this.lastX;
        this.sidebarWidth = Math.min(Math.max(newWidth, this.minSidebarWidth), this.maxSidebarWidth);
      } else {
        this.sidebarWidth = 0;
      }

      this.lastX = currentX;
    } else if (this.resizingTerminal) {
      const currentY = event.clientY;

      // Calculate a new height
      if (currentY < this.windowHeight - this.minTerminalHeight) {
        const newHeight = this.terminalHeight - currentY + this.lastY;
        this.terminalHeight = Math.min(Math.max(newHeight, this.minTerminalHeight), this.maxTerminalHeight);
      } else {
        this.terminalHeight = 0;
      }

      this.lastY = currentY;
    }

    // Force detect changes to avoid https://github.com/angular/angular/issues/6005
    this.changeDetector.detectChanges();
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.resizingSidebar = false;
    this.resizingTerminal = false;
  }

  resizeSidebar(event: MouseEvent): void {
    this.resizingSidebar = true;
    this.lastX = event.clientX;
  }

  resizeTerminal(event: MouseEvent): void {
    this.resizingTerminal = true;
    this.lastY = event.clientY;
  }

  get sidebarWidth(): number {
    return this._sidebarWidth;
  }

  set sidebarWidth(width: number) {
    this._sidebarWidth = width;
    this.storageService.set(STORAGE_KEYS['sidebarWidth'], width);
  }

  get editorWidth(): number {
    return this.windowWidth - this.sidebarWidth - this.tabsWidth;
  }

  get maxSidebarWidth(): number {
    return this.windowWidth - this.minSidebarWidth;
  }

  get terminalHeight(): number {
    return this._terminalHeight;
  }

  set terminalHeight(height: number) {
    this._terminalHeight = height;
  }

  get maxTerminalHeight(): number {
    return this.windowHeight - this.minTerminalHeight;
  }

  get editorHeight(): number {
    return this.windowHeight - this.terminalHeight;
  }

  private get windowHeight(): number {
    return document.documentElement.getBoundingClientRect().height
      || document.body.getBoundingClientRect().height;
  }

  private get windowWidth(): number {
    return document.documentElement.getBoundingClientRect().width
      || document.body.getBoundingClientRect().width;
  }
}
