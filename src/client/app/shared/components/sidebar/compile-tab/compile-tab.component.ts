import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';

// Components
import { DetailsDialogComponent } from './details-dialog/details-dialog.component';

// Models
import {
  ISolcVersion, ICompilerResult, ICompilerError,
  ICompilerContract
} from '../../../models/index';

// Services
import {
  FileService, EditorService, CompilerService,
  SolcVersionsService
} from '../../../services/index';

@Component({
  moduleId: module.id,
  selector: 'sd-compile-tab',
  templateUrl: 'compile-tab.component.html',
  styleUrls: ['compile-tab.component.css']
})
export class CompileTabComponent implements OnInit, OnDestroy {
  private _loadingCompiler: boolean;
  private _compilationResult: ICompilerResult = {
    errors: [],
    contracts: []
  };
  private _fileSavedSub: Subscription;
  private _compilationSub: Subscription;
  private _compiling: boolean;
  private _selectedVersion: ISolcVersion;
  private _subsInitialized: boolean;
  private _selectedContract: ICompilerContract;

  constructor(private compilerService: CompilerService,
              private fileService: FileService,
              private editorService: EditorService,
              private solcVersionsService: SolcVersionsService,
              private dialog: MatDialog) {
    this._selectedVersion = solcVersionsService.defaultVersion;
  }


  /*
   * Lifecycle hooks
   * 
   * init gets available solidity compiler versions
   * defaults to latest
   */

  ngOnInit() {
    this.solcVersionsService.loadVersions();
    this.loadCompiler();
  }

  ngOnDestroy() {
    this._fileSavedSub.unsubscribe();
    this._compilationSub.unsubscribe();
  }


  /*
   * Public functions
   */

  /**
   * Compiles the given current selected file
   */
  compile(): void {
    // get files for compilation from the file service
    const selectedFile = this.fileService.selectedFile;
    if (!selectedFile) {
      return;
    }
    // get the content of the files plus the one in the editor currently
    const sources: any = {};
    sources[selectedFile.name] = {
      'content': this.editorService.content
    };
    // start compilation
    // defer compilation to compile service and compile
    // get result and stop compilation
    this._compiling = true;
    this.compilerService.compile(sources).then((result) => {
      this._compilationResult = result;
      this._compiling = false;
    });
  }

  /**
   * Moves the editor line to highlight a specific error
   * @param {ICompilerError} error The error we're going to
   */
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

  /**
   * Displays a contract details modal for the selected contract
   */
  showContractDetails(): void {
    if (!this._selectedContract) {
      return;
    }

    console.log(this.selectedContract);
    const dialogRef = this.dialog.open(DetailsDialogComponent, {
      width: '500px',
      data: this.selectedContract
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  /*
   * Private functions
   */

  /**
   * Loads the selected compiler and sets up subscriptions
   */
  private loadCompiler(): void {
    this._loadingCompiler = true;
    this.compilerService.loadCompiler(this.selectedVersion.url).then(() => {
      this._loadingCompiler = false;
      this.compile();

      // This is a hack that forces the first compilation to work
      // TODO: Fix this
      setTimeout(() => {
        this.compile();
      }, 100);

      this.initializeSubs();
    });
  }

  /**
   * Sets up event subscriptions
   */
  private initializeSubs(): void {
    if (this._subsInitialized) {
      return;
    }

    this._fileSavedSub = this.fileService.onFileSaved.subscribe(() => {
      this.compile();
    });
    this._compilationSub = this.compilerService.onCompilationRequested.subscribe(() => {
      this.compile();
    });

    this._subsInitialized = true;
  }

  /**
   * Returns an error type given an error string
   * @param {string} errorString An error string
   * @return {string} The error type
   */
  private parseErrorType(errorString: string): string {
    if (errorString.toLowerCase().includes('warning')) {
      return 'warning';
    } else {
      return 'error';
    }
  }


  /*
   * Public getters/setters
   */

  get contracts(): ICompilerContract[] {
    return this.compilerService.contracts;
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

  get selectedContract(): ICompilerContract {
    return this._selectedContract;
  }

  set selectedContract(contract: ICompilerContract) {
    this._selectedContract = contract;
  }
}
