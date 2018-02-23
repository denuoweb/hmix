import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Models
import { ICompilerResult, ICompilerError } from '../../../models/compiler-result.model';

// Services
import { FileService } from '../../../services/file/file.service';
import { EditorService } from '../../../services/editor/editor.service';
import { CompilerService } from '../../../services/compiler/compiler.service';

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
  private _compiling: boolean;

  constructor(private compilerService: CompilerService,
              private fileService: FileService,
              private editorService: EditorService) { }

  ngOnInit() {
    this.loadCompiler();
  }

  compile(): void {
    const selectedFile = this.fileService.selectedFile;

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
    this.editorService.highlightLine(error.lineNumber);
    this.editorService.gotoLine(error.lineNumber, error.columnNumber);
  }

  private loadCompiler(): void {
    this._loadingCompiler = true;
    this.compilerService.loadCompiler().then(() => {
      this._loadingCompiler = false;
      this.compile();
      this.fileSavedSubscription = this.fileService.onFileSaved.subscribe(() => {
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
}
