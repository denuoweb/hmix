import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { StorageService } from '../shared/services/storage/storage.service';

@Component({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
})
export class HomeComponent implements OnInit {
  private sidebarWidthKey = 'qmix-sidebar-width';
  private tabsWidth = 50;
  private defaultSidebarWidth = 200;
  private minSidebarWidth = 150;
  private _sidebarWidth: number;
  private isResizing: boolean;
  private lastX: number;

  constructor(private changeDetector: ChangeDetectorRef,
              private storageService: StorageService) { }

  ngOnInit() {
    this.sidebarWidth = this.storageService.get(this.sidebarWidthKey) || this.defaultSidebarWidth;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;
    const currentX = event.clientX;

    // Calculate a new width
    if (currentX > 100) {
      const newWidth = this.sidebarWidth + currentX - this.lastX;
      this.sidebarWidth = Math.min(Math.max(newWidth, this.minSidebarWidth), this.maxSidebarWidth);
    } else {
      this.sidebarWidth = 0;
    }
    this.lastX = currentX;

    // Force detect changes to avoid https://github.com/angular/angular/issues/6005
    this.changeDetector.detectChanges();
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.isResizing = false;
  }

  resizeSidebar(event: MouseEvent): void {
    this.isResizing = true;
    this.lastX = event.clientX;
  }

  get sidebarWidth(): number {
    return this._sidebarWidth;
  }

  set sidebarWidth(sidebarWidth: number) {
    this._sidebarWidth = sidebarWidth;
    this.storageService.set(this.sidebarWidthKey, sidebarWidth);
  }

  get editorWidth(): number {
    return this.windowWidth - this.sidebarWidth - this.tabsWidth;
  }

  get maxSidebarWidth(): number {
    return this.windowWidth - this.minSidebarWidth;
  }

  private get windowWidth(): number {
    return document.documentElement.clientWidth
      || document.body.clientWidth;
  }
}
