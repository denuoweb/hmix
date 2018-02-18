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
  private _expanded = false;

  constructor(private fileService: FileService) { }

  toggleExpand(): void {
    this._expanded = !this._expanded;
  }

  openFile(file: File): void {
    this.fileService.openFile(file);
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
    return this._expanded || this.isRootFolder;
  }
}
