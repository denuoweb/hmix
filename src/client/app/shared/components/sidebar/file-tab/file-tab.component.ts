import { Component, AfterViewInit } from '@angular/core';

// Models
import { File } from '../../../models/file.model';

// Services
import { CompilerService } from '../../../services/compiler/compiler.service';
import { FileService } from '../../../services/file/file.service';

// Constants
import { VERSION } from '../../../constants/version';

@Component({
  moduleId: module.id,
  selector: 'sd-file-tab',
  templateUrl: 'file-tab.component.html',
  styleUrls: ['file-tab.component.css']
})
export class FileTabComponent implements AfterViewInit {
  // file manipulation booleans
  isCreatingNewFile = false;
  isRenamingFile = false;
  fileToBeRenamed: File;
  version = VERSION;
  // requires a File Setvice to manipulate files
  // requires compiler service to try to compile files
  constructor(private fileService: FileService,
              private compilerService: CompilerService) { }

  ngAfterViewInit() {
    this.watchInputClick();
  }

  // public file funcitons
  // use file service to perform actions

  get files(): File[] {
    return this.fileService.sortedFiles;
  }

  openFile(file: File): void {
    this.fileService.openFile(file);
    this.compilerService.requestCompilation();
  }

  deleteFile(file: File): void {
    this.fileService.deleteFile(file);
  }

  renameFile(file: File): void {
    this.isRenamingFile = true;
    this.fileToBeRenamed = file;
    this.focusFileInput();
  }

  createFile(): void {
    this.isCreatingNewFile = true;
    this.focusFileInput();
  }

  private focusFileInput(): void {
    // Focus the file input automatically
    setTimeout(() => {
      document.getElementById('new-file-input').focus();
    }, 100);
  }

  //check for new file click action
  //set context menus
  private watchInputClick(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      if ((<any>event.target).id === 'new-file-btn') {
        return;
      }
      this.finishEditingFile(event);
    });
    document.addEventListener('contextmenu', (event: MouseEvent) => {
      this.finishEditingFile(event);
    });
  }

  // check what is being done with file
  // rename or create file
  private finishEditingFile(event?: MouseEvent): void {
    if (!this.isCreatingNewFile && !this.isRenamingFile) {
      return;
    }

    const newFileInput = <any>(document.getElementById('new-file-input'));
    if (newFileInput && (!event || !newFileInput.contains(event.target))) {
      const newFileName: string = newFileInput.value.trim();

      // Don't do anything if we've been given an empty string
      if (newFileName !== '') {
        if (this.isCreatingNewFile) {
          this.fileService.createFile(newFileName);
        } else if (this.isRenamingFile) {
          this.fileService.renameFile(this.fileToBeRenamed, newFileName);
        }
      }

      // Reset everything
      this.isCreatingNewFile = false;
      this.isRenamingFile = false;
      this.fileToBeRenamed = undefined;
    }
  }
}
