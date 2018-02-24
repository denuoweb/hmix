import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Models
import { ISolcVersion } from '../../../models/solc-version.model';
import { ICompilerResult, ICompilerError } from '../../../models/compiler-result.model';

// Services
import { FileService } from '../../../services/file/file.service';
import { EditorService } from '../../../services/editor/editor.service';
import { CompilerService } from '../../../services/compiler/compiler.service';
import { SolcVersionsService } from '../../../services/solc-versions/solc-versions.service';

@Component({
  moduleId: module.id,
  selector: 'sd-compile-tab',
  templateUrl: 'compile-tab.component.html',
  styleUrls: ['compile-tab.component.css']
})
export class CompileTabComponent implements OnInit {
  private _loadingCompiler: boolean;
  private _compilationResult: ICompilerResult = {
    errors: [],
    contracts: []
  };
  private fileSavedSubscription: Subscription;
  private compilationSubscription: Subscription;
  private _compiling: boolean;
  private _selectedVersion: ISolcVersion;

  constructor(private compilerService: CompilerService,
              private fileService: FileService,
              private editorService: EditorService,
              private solcVersionsService: SolcVersionsService) {
    this._selectedVersion = solcVersionsService.defaultVersion;
  }

  ngOnInit() {
    this.solcVersionsService.loadVersions();
    this.loadCompiler();
  }

  compile(): void {
    const selectedFile = this.fileService.selectedFile;
    if (!selectedFile) {
      return;
    }

    // TODO: Allow file imports
    const sources: any = {};
    sources[selectedFile.name] = {
      'content': this.editorService.content
    };

    this._compiling = true;
    this.compilerService.compile(sources).then((result) => {
      this._compilationResult = result;
      this._compiling = false;
    });
  }

  gotoError(error: ICompilerError): void {
    // Some errors might not be referencing a specific line
    if (!error.lineNumber || !error.columnNumber) {
      return;
    }

    // Open the file we're referencing
    const errorFile = this.fileService.getFileByName(error.fileName);
    this.fileService.selectFile(errorFile);

    // Go to the error
    this.editorService.highlightLine(error.lineNumber);
    this.editorService.gotoLine(error.lineNumber, error.columnNumber);
  }

  private loadCompiler(): void {
    this._loadingCompiler = true;
    this.compilerService.loadCompiler(this.selectedVersion.url).then(() => {
      this._loadingCompiler = false;
      this.compile();

      // Unsubscribe to make sure we don't create multiple subscriptions
      if (this.fileSavedSubscription) {
        this.fileSavedSubscription.unsubscribe();
      }
      if (this.compilationSubscription) {
        this.compilationSubscription.unsubscribe();
      }

      // Set up subscriptions
      this.fileSavedSubscription = this.fileService.onFileSaved.subscribe(() => {
        this.compile();
      });
      this.compilationSubscription = this.compilerService.onCompilationRequested.subscribe(() => {
        this.compile();
      });
    });
  }

  private parseErrorType(errorType: string): string {
    errorType = errorType.toLowerCase();
    if (errorType.includes('warning')) {
      return 'warning';
    } else {
      return 'error';
    }
  }

  get loadingCompiler(): boolean {
    return this._loadingCompiler;
  }

  get compilerVersion(): string {
    return this.compilerService.compilerVersion;
  }

  get autoCompile(): boolean {
    return this.compilerService.autoCompile;
  }

  set autoCompile(autoCompile: boolean) {
    this.compilerService.autoCompile = autoCompile;
  }

  get errors(): ICompilerError[] {
    return this._compilationResult.errors;
  }

  get compiling(): boolean {
    return this._compiling;
  }

  get solcVersions(): ISolcVersion[] {
    return this.solcVersionsService.solcVersions;
  }

  get selectedVersion(): ISolcVersion {
    return this._selectedVersion;
  }

  set selectedVersion(version: ISolcVersion) {
    this._selectedVersion = version;
  }
}
