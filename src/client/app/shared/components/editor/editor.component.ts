import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';

// Services
import { CompilerService, EditorService, FileService } from '../../services/index';

// Models
import { File } from '../../models/index';

// Ace editor imports
import * as ace from 'brace';
import 'brace/mode/javascript';
import './styling/ace.theme';
import './styling/solidity.mode';

@Component({
  moduleId: module.id,
  selector: 'sd-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.css']
})
export class EditorComponent implements AfterViewInit {
  private _editor: any;

  constructor(private fileService: FileService,
              private editorService: EditorService,
              private changeDetector: ChangeDetectorRef,
              private compilerService: CompilerService) { }


  /*
   * Lifecycle hooks
   */

  ngAfterViewInit(): void {
    this.initEditor();
    this.initShortcuts();
    this.initSaveCheck();
  }


  /*
   * Public functions
   */

  /**
   * Selects a file and requests its compilation
   * @param {File} file
   */
  selectFile(file: File): void {
    this.fileService.selectFile(file);
    this.compilerService.requestCompilation();
  }

  /**
   * Closes a file
   * @param {File} file
   */
  closeFile(file: File): void {
    this.fileService.closeFile(file);
  }

  /**
   * Closes all open files
   */
  closeAll(): void {
    this.openFiles.forEach((file) => {
      this.closeFile(file);
    });
  }

  /**
   * Checks if a file is selected
   * @param {File} file
   * @return {boolean} Returns true if the file is selected, false otherwise;
   */
  isSelected(file: File): boolean {
    return file === this.selectedFile;
  }


  /*
   * Private functions
   */

  /**
   * Initializes the ace editor
   */
  private initEditor(): void {
    // Attach the editor to the DOM
    this._editor = ace.edit('ace-container');

    // Technically we're using a custom javascript mode (styling/solidity.mode.ts)
    this._editor.getSession().setMode('ace/mode/javascript');
    this._editor.setTheme('ace/theme/qmix');

    // Let the file service know whenever we've changed the current file
    this._editor.getSession().on('change', () => {
      this.fileService.onSelectedFileContentChanged();
    });

    this.editorService.editor = this._editor;

    this.fileService.loadSelectedFile();
    this.changeDetector.detectChanges();
  }

  /**
   * Initializes ace shortcuts
   */
  private initShortcuts(): void {
    const commands = this._editor.commands;

    // Ctrl+S/CMD+S triggers save
    commands.addCommand({
      name: 'save',
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S'
      },
      exec: () => {
        this.fileService.saveFile(this.selectedFile);
      }
    });
  }

  /**
   * Ensures that a warning appears if the user has unsaved
   * files and attempts to close the browser window
   */
  private initSaveCheck(): void {
    // Listen to an unload (window close) event
    window.addEventListener('beforeunload', (event: Event) => {
      // Confirm with the user before closing if we have unsaved files
      if (this.fileService.hasUnsavedFiles) {
        event.returnValue = true;
      }
    });
  }


  /*
   * Public getters/setters
   */

  get openFiles(): File[] {
    return this.fileService.openFiles;
  }

  get selectedFile(): File {
    return this.fileService.selectedFile;
  }
}
