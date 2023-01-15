import { Injectable, EventEmitter } from '@angular/core';

// Services
import { EditorService } from '../editor/editor.service';
import { StorageService } from '../storage/storage.service';

// Models
import { File, IFileObject } from '../../models/file.model';

// External Imports
import { UUID } from 'angular2-uuid';

@Injectable()
export class FileService {
  // set keys to find files in storage
  onFileSaved: EventEmitter<File> = new EventEmitter<File>();
  private _filesKey = 'hmix-files';
  private _selectedFileIdKey = 'hmix-selected-file';
  private _files: File[] = [];
  private _selectedFile: File;
  // get start the storage and editor services
  constructor(private storageService: StorageService,
              private editorService: EditorService) {
    this.loadFileTree();
  }

  // public file functionality functions

  // push into list of files and open it
  createFile(name: string): void {
    const newFile = new File({
      id: UUID.UUID(),
      name: name,
      content: '',
      isOpen: false
    });
    this._files.push(newFile);
    this.openFile(newFile);
  }

  // selector opens the file
  // sets the editor to display file contents
  selectFile(file: File): void {
    if (!file.isOpen) {
      this.openFile(file);
    }
    this.selectedFile = file;
    this.editorService.content = file.tempContent;
  }

  // open file func
  openFile(file: File): void {
    file.isOpen = true;
    this.selectFile(file);
    this.saveFileTree();
  }

  closeFile(file: File): void {
    this.findFileToSelect(file);
    file.isOpen = false;
    this.saveFileTree();
  }

  saveFile(file: File): void {
    // Only way to fire this if we changed the content
    if (file.content !== this.editorService.content) {
      this.onFileSaved.emit(file);
    }
    //save contents of the editor into this file
    file.content = this.editorService.content;
    file.isSaved = true;
    this.saveFileTree();
  }

  deleteFile(file: File): void {
    this.findFileToSelect(file);
    this._files = this._files.filter((_file) => {
      return _file !== file;
    });
    this.saveFileTree();
  }
  renameFile(file: File, newName: string): void {
    file.name = newName;
    this.saveFileTree();
  }

  onSelectedFileContentChanged(): void {
    this.selectedFile.tempContent = this.editorService.content;
    this.selectedFile.isSaved = this.selectedFile.tempContent === this.selectedFile.content;
  }

  loadSelectedFile(): void {
    if (this.selectedFileId) {
      this.selectFile(this._files.find((file) => {
        return file.id === this.selectedFileId;
      }));
    }
  }

  getFileByName(fileName: string): File {
    return this._files.find((file) => {
      return file.name === fileName;
    });
  }

  // private file functionality functions

  // this function only used by close and delete
  // will open the next available file if there is one
  private findFileToSelect(lastSelectedFile: File): void {
    if (lastSelectedFile !== this.selectedFile) {
      return;
    }
    const fileIndex = this.openFiles.indexOf(lastSelectedFile);
    let newFileIndex: number;
    if (fileIndex === 0) {
      newFileIndex = 1;
    } else if (fileIndex === this.openFiles.length - 1) {
      newFileIndex = fileIndex - 1;
    } else {
      newFileIndex = fileIndex + 1;
    }

    this.selectedFile = this.openFiles.length > 1 ? this.openFiles[newFileIndex] : null;
    if (this.selectedFile) {
      this.selectFile(this.selectedFile);
    }
  }

  private loadFileTree(): void {
    const files = this.storageService.get(this._filesKey) || [];
    this._files = files.map((fileObject: IFileObject) => {
      return new File(fileObject);
    });
  }

  private saveFileTree(): void {
    const fileObjects = this.files.map((file) => {
      return file.toObject();
    });
    this.storageService.set(this._filesKey, fileObjects);
  }

  // getters and setters

  get hasUnsavedFiles(): boolean {
    return this._files.some((file) => {
      return !file.isSaved;
    });
  }

  get openFiles(): File[] {
    return this._files.filter((file) => {
      return file.isOpen;
    });
  }

  get sortedFiles(): File[] {
    return this._files.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  get selectedFile(): File {
    return this._selectedFile;
  }

  set selectedFile(file: File) {
    this._selectedFile = file;
    this.storageService.set(this._selectedFileIdKey, file ? file.id : undefined);
  }

  get selectedFileId(): string {
    return this.storageService.get(this._selectedFileIdKey);
  }

  get files(): File[] {
    return this._files;
  }
}
