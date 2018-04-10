import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {
  private _tabsWith = 50;
  private _defaultSidebarWidth = 200;
  private _defaultTerminalHeight = 250;
  private _minSidebarWidth = 150;
  private _minTerminalHeight = 100;
  private _terminalHeight: number;
  private _sidebarWidth: number;
  private _resizingSidebar: boolean;
  private _resizingTerminal: boolean;
  private _lastX: number;
  private _lastY: number;
  private _tabChangeSub: Subscription;
  private _terminalOpenSub: Subscription;

  constructor(private changeDetector: ChangeDetectorRef,
              private storageService: StorageService,
              private tabService: TabService,
              private terminalService: TerminalService) { }


  /*
   * Lifecycle hooks
   */

  ngOnInit() {
    this.sidebarWidth = this.storageService.get(STORAGE_KEYS['sidebarWidth']) || this._defaultSidebarWidth;
    this.terminalHeight = this.storageService.get(STORAGE_KEYS['terminalHeight']) || this._defaultTerminalHeight;

    // Reset the sidebar width when the active tab changes
    this._tabChangeSub = this.tabService.onActiveTabChange.subscribe(() => {
      if (this.sidebarWidth < this._minSidebarWidth) {
        this.sidebarWidth = this._defaultSidebarWidth;
      }
    });

    // Reset the terminal width when requested to open
    this._terminalOpenSub = this.terminalService.onTerminalOpenRequest.subscribe(() => {
      if (this.terminalHeight < this._minTerminalHeight) {
        this.terminalHeight = this._minTerminalHeight;
      }
    });
  }

  ngOnDestroy() {
    // Stop all subscriptions to avoid memory leaks
    this._tabChangeSub.unsubscribe();
    this._terminalOpenSub.unsubscribe();
  }

  /*
   * Host listeners
   */

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this._resizingSidebar && !this._resizingTerminal) return;

    if (this._resizingSidebar) {
      const currentX = event.clientX;

      // Calculate a new width
      if (currentX > this._minSidebarWidth) {
        const newWidth = this.sidebarWidth + currentX - this._lastX;
        this.sidebarWidth = Math.min(Math.max(newWidth, this._minSidebarWidth), this.maxSidebarWidth);
      } else {
        this.sidebarWidth = 0;
      }

      this._lastX = currentX;
    } else if (this._resizingTerminal) {
      const currentY = event.clientY;

      // Calculate a new height
      if (currentY < this.windowHeight - this._minTerminalHeight) {
        const newHeight = this.terminalHeight - currentY + this._lastY;
        this.terminalHeight = Math.min(Math.max(newHeight, this._minTerminalHeight), this.maxTerminalHeight);
      } else {
        this.terminalHeight = 0;
      }

      this._lastY = currentY;
    }

    // Force detect changes to avoid https://github.com/angular/angular/issues/6005
    this.changeDetector.detectChanges();
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this._resizingSidebar = false;
    this._resizingTerminal = false;
  }


  /*
   * Public functions
   */

  /**
   * Resize the sidebar based on a mouse event
   * @param {MouseEvent} event
   */
  resizeSidebar(event: MouseEvent): void {
    this._resizingSidebar = true;
    this._lastX = event.clientX;
  }

  /**
   * Resize the terminal based on a mouse event
   * @param {MouseEvent} event
   */
  resizeTerminal(event: MouseEvent): void {
    this._resizingTerminal = true;
    this._lastY = event.clientY;
  }


  /*
   * Public getters/setters
   */

  get sidebarWidth(): number {
    return this._sidebarWidth;
  }

  set sidebarWidth(width: number) {
    this._sidebarWidth = width;
    this.storageService.set(STORAGE_KEYS['sidebarWidth'], width);
  }

  get terminalHeight(): number {
    return this._terminalHeight;
  }

  set terminalHeight(height: number) {
    this._terminalHeight = height;
    this.storageService.set(STORAGE_KEYS['terminalHeight'], height);
  }

  get editorWidth(): number {
    return this.windowWidth - this.sidebarWidth - this._tabsWith;
  }

  get editorHeight(): number {
    return this.windowHeight - this._terminalHeight;
  }

  get tabsWidth(): number {
    return this._tabsWith;
  }


  /*
   * Private getters/setters
   */

  private get maxSidebarWidth(): number {
    return this.windowWidth - this._minSidebarWidth;
  }

  private get maxTerminalHeight(): number {
    return this.windowHeight - this._minTerminalHeight;
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
