import { Component, Input } from '@angular/core';
import { File, Folder } from '../../../models/file-models/index';
import { FileService } from '../../../services/file/file.service';

@Component({
  moduleId: module.id,
  selector: 'sd-tree-node',
  templateUrl: 'tree-node.component.html',
  styleUrls: ['tree-node.component.css']
})
export class TreeNodeComponent {
  @Input() fileItem: File|Folder;
  private _currentParent: Folder;
  private creatingFile: boolean;
  private creatingFolder: boolean;
  private padding = 15;

  constructor(private fileService: FileService) {
    this.watchInputClick();
  }

  toggleExpand(): void {
    if (this.fileItem instanceof Folder) {
      this.fileItem.expanded = !this.fileItem.expanded;
      this.fileService.saveFileTree();
    }
  }

  openFile(file: File): void {
    this.fileService.openFile(file);
  }

  deleteFile(file: File): void {
    this.fileService.deleteFile(file);
  }

  deleteFolder(folder: Folder): void {
    this.fileService.deleteFolder(folder);
  }

  startCreateFile(parent: Folder): void {
    parent.expanded = true;
    this.currentParent = parent;
    this.creatingFile = true;
  }
  
  startCreateFolder(parent: Folder): void {
    parent.expanded = true;
    this.currentParent = parent;
    this.creatingFolder = true;
  }
  
  watchInputClick(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      this.createFileItem(event);
    });
    document.addEventListener('contextmenu', (event: MouseEvent) => {
      this.createFileItem(event);
    });
  }

  onNewItemEnter(): void {
    this.createFileItem();
  }
  
  private createFileItem(event?: MouseEvent): void {
    if (!this.currentParent) {
      return;
    }
    const newItemInput = <any>(document.getElementById('new-item-input'));
    if (newItemInput && (!event || !newItemInput.contains(event.target))) {
      const newItemName: string = newItemInput.value.trim();
      if (newItemName !== '') {
        if (this.creatingFile) {
          this.fileService.createFile(newItemName, this.currentParent);
        } else if (this.creatingFolder) {
          this.fileService.createFolder(newItemName, this.currentParent);
        }
      }
      this.creatingFile = false;
      this.creatingFolder = false;
      this.currentParent = undefined;
    }
  }

  get currentParent(): Folder {
    return this._currentParent;
  }

  set currentParent(parent: Folder) {
    this._currentParent = parent;
    if (parent) {
      setTimeout(() => {
        const newItemInput = <any>(document.getElementById('new-item-input'));
        newItemInput.focus();
      }, 25);
    }
  }

  get isFile(): boolean {
    return this.fileItem instanceof File;
  }

  get isFolder(): boolean {
    return this.fileItem instanceof Folder;
  }

  get isRootFolder(): boolean {
    return this.fileItem.name === '';
  }

  get expanded(): boolean {
    return (this.fileItem instanceof Folder && this.fileItem.expanded) || this.isRootFolder;
  }

  get itemNamePadding(): number {
    return (this.fileService.getItemDepth(this.fileItem) + 1) * this.padding + 10;
  }
}
