import { Injectable, EventEmitter } from '@angular/core';

import { compilerInput } from './compiler-input';

// Services
import { StorageService } from '../storage/storage.service';
import { FileService } from '../file/file.service';

// Models
import { ICompilerSettings } from '../../models/compiler-settings.model';
import { ICompilerResult, ICompilerContract, ICompilerError } from '../../models/compiler-result.model';

// Globals
import { solc } from '../../globals';

// Constants
import { STORAGE_KEYS } from '../../constants/storage-keys';

@Injectable()
export class CompilerService {
  onCompilationRequested: EventEmitter<void> = new EventEmitter<void>();
  onCompilationStarted: EventEmitter<void> = new EventEmitter<void>();
  onCompilationFinished: EventEmitter<void> = new EventEmitter<void>();
  private compilerWorkerScriptUrl = '/app/shared/services/compiler/worker.js';
  private webWorker: Worker;
  private syncCompiler: any;
  private _settings: ICompilerSettings;
  private _compilerVersion: string;
  private onCompilerLoaded: EventEmitter<any> = new EventEmitter<any>();
  private onWebWorkerFinished: EventEmitter<any> = new EventEmitter<any>();
  private _latestCompilationResult: ICompilerResult = {
    errors: [],
    contracts: []
  };

  // needs to access storage and files
  constructor(private storageService: StorageService,
              private fileService: FileService) {
    this.loadSettings();
  }

  // compilation function takes in source files and their contents
  // compile takes in sources and sets retry boolean to true by default
  // returns promise of compiler result
  async compile(sources: {
    [fileName: string]: {
      [content: string]: string
    }
  }, retry = true): Promise<ICompilerResult> {
    // compile using wither webworker or direct compile
    const compilationPromise = this.useWebWorker ? this.compileWebWorker(sources) : this.compileSync(sources);
    this.onCompilationStarted.emit();
    // wait for compilation promise
    return new Promise<ICompilerResult>((resolve, reject) => {
      // if compilation was missing inputs and retry is true, get imports and try to compile again
      // this time compile is called with retry set to false as imports were gathered
      compilationPromise.then((result) => {
        if (result.missingInputs) {
          sources = this.gatherImports(sources, result.missingInputs);
          if (retry) {
            this.compile(sources, false).then((result) => {
              resolve(result);
            });
          // file compiled with imports still missing inputs
          // parse the results (will contain error)
          } else {
            this.parseCompilationResult(result);
            this.onCompilationFinished.emit();
            resolve(this._latestCompilationResult);
          }
        // compilation went through, parse results
        } else {
          this.parseCompilationResult(result);
          this.onCompilationFinished.emit();
          resolve(this._latestCompilationResult);
        }
      });
    });
  }

  // load compiler for requested solidity version
  // either use web worker or loadsync
  async loadCompiler(solcUrl: string): Promise<void> {
    return this.useWebWorker ? this.loadWebWorker(solcUrl) : this.loadSync(solcUrl);
  }

  requestCompilation(): void {
    this.onCompilationRequested.emit();
  }

  // when not using webworker
  // from solc url connect to appropriate version of solc compiler
  private async loadSync(solcUrl: string): Promise<void> {
    delete (<any>window).Module;
    (<any>window).Module = undefined;

    const newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = solcUrl;
    document.getElementsByTagName('head')[0].appendChild(newScript);

    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (!(<any>window).Module) {
          return;
        }
        this.syncCompiler = solc((<any>window).Module);
        this._compilerVersion = this.syncCompiler.version();
        clearInterval(checkInterval);
        resolve();
      }, 200);
    });
  }

  // use the worker helper file to load and connect to solc compiler for appropriate version
  // webworker option will use worker for compilation
  private async loadWebWorker(solcUrl: string): Promise<void> {
    if (!(<any>window).Worker) {
      this.useWebWorker = false;
      return;
    }

    this.webWorker = new Worker(this.compilerWorkerScriptUrl);
    this.webWorker.postMessage({
      command: 'LoadVersion',
      solcUrl: solcUrl
    });

    // Listen for messages
    this.webWorker.onmessage = (msg) => {
      const data = msg.data;
      switch (data.command) {
        case 'VersionLoaded':
          this.onCompilerLoaded.emit({
            version: data.version
          });
          break;

        case 'CompileResult':
          this.onWebWorkerFinished.emit(data);
          break;
      }
    };

    return new Promise<void>((resolve) => {
      const compilationFinishedSub = this.onCompilerLoaded.subscribe((result: any) => {
        this._compilerVersion = result.version;
        compilationFinishedSub.unsubscribe();
        resolve();
      });
    });
  }

  // non webworker compile function
  // takes in source files returns promise of compilation result
  private compileSync(sources: {
    [fileName: string]: {
      [content: string]: string
    }
  }): Promise<any> {
    // call on solc compiler to compile files
    return new Promise<any>((resolve, reject) => {
      const input = compilerInput(sources, this.optimize);
      const missingInputs: any[] = [];
      const result = this.syncCompiler.compileStandardWrapper(input, (path: any) => {
        missingInputs.push(path);
        return {
          error: 'Deferred import'
        };
      });
      resolve({
        result: result,
        missingInputs: missingInputs
      });
    });
  }

  // compile function when using web worker
  // defers compilation to worker.js helper
  private compileWebWorker(sources: {
    [fileName: string]: {
      [content: string]: string
    }
  }): Promise<any> {
    // uses worker to connect to solc compiler to compile files given
    // returns promise of compilations results
    return new Promise<any>((resolve, reject) => {
      const input = compilerInput(sources, this.optimize);
      this.webWorker.postMessage({
        command: 'CompileRequest',
        input: input
      });
      const compilationResultSub = this.onWebWorkerFinished.subscribe((result: any) => {
        compilationResultSub.unsubscribe();
        resolve(result);
      });
    });
  }

  // get all the imports to be able to properly compile
  // called when first round of compilation was missing inputs
  private gatherImports(sources: {
    [fileName: string]: {
      [content: string]: string
    }
  }, missingFiles: string[] = []): any {
    const importRegex = /^\s*import\s*[\'\"]([^\'\"]+)[\'\"];/g;
    //find import files in path
    for (const fileName in sources) {
      let match;
      while ((match = importRegex.exec(sources[fileName].content))) {
        let importFilePath = match[1];
        if (importFilePath.startsWith('./')) {
          importFilePath = importFilePath.slice(2);
        }
        // if not in missing path list add import file to list
        if (!missingFiles.includes(importFilePath)) {
          missingFiles.push(importFilePath);
        }
      }
    }
    // check for all missing files
    while (missingFiles.length > 0) {
      const missingFile = missingFiles.pop();
      // if already in sources continue
      if (missingFile in sources) {
        continue;
      }
      // check if file can be found in library
      const foundFile = this.fileService.getFileByName(missingFile);
      // if so add to sources with its contents
      if (foundFile) {
        sources[foundFile.name] = {
          content: foundFile.content
        };
      }
    }
    // return sources wih all new imports, to try and compile again
    return sources;
  }

  //check which parsing error was found, reports back with location and error
  private parseError(error: string): ICompilerError {
    const pattern: any = /(.*?):(\d+):(\d+): (.*?): ([^]+)/g;
    const match = pattern.exec(error);

    // This error doesn't fit the mold
    if (!match) {
      return {
        fileName: null,
        lineNumber: null,
        columnNumber: null,
        errorType: 'error',
        message: error
      };
    }

    return {
      fileName: match[1],
      lineNumber: parseInt(match[2], 10),
      columnNumber: parseInt(match[3], 10),
      errorType: match[4],
      message: match[5]
    };
  }

  // check compilation result for errors if any
  private parseErrors(result: any): void {
    const errors: any = [];
    if (result.error) {
      errors.push(result.error);
    }
    if (result.errors) {
      result.errors.forEach((error: any) => {
        errors.push(error);
      });
    }

    // Exclude invalid checksum errors
    // TODO: Handle this properly by checking if the address is a valid Qtum address
    const filteredErrors = errors.filter((error: any) => {
      return !error.message.includes('invalid checksum');
    });
    // get error messages
    this._latestCompilationResult.errors = [];
    for (const error of filteredErrors) {
      this._latestCompilationResult.errors.push(this.parseError(error.formattedMessage));
    }
  }

  // from compilation results parse contracts
  private parseContracts(result: any): void {
    if (!result.contracts) {
      return;
    }

    const getContractName = (contract: string) => {
      const pattern = /(.*)\:([^.]+)/g;
      const split = pattern.exec(contract);
      return split ? split[2] : contract;
    };

    this._latestCompilationResult.contracts = [];
    Object.keys(result.contracts).forEach((context: any) => {
      context = result.contracts[context];
      Object.keys(context).forEach((contract: any) => {
        this._latestCompilationResult.contracts.push(Object.assign({
          name: getContractName(contract)
        }, context[contract]));
      });
    });
  }

  // parse the contracts and any errors from the compilation result
  private parseCompilationResult(result: any): void {
    const resultObject = JSON.parse(result.result);
    this.parseContracts(resultObject);
    this.parseErrors(resultObject);
  }

  // load settings, all true by default
  private loadSettings(): void {
    this._settings = this.storageService.get(STORAGE_KEYS['compilerSettings']) || {
      useWebWorker: true,
      autoCompile: true,
      optimize: true
    };
  }

  private saveSettings(): void {
    this.storageService.set(STORAGE_KEYS['compilerSettings'], this._settings);
  }

  // public getters and setters

  get useWebWorker(): boolean {
    return this._settings.useWebWorker;
  }

  set useWebWorker(useWebWorker: boolean) {
    this._settings.useWebWorker = useWebWorker;
    this.saveSettings();
  }

  get autoCompile(): boolean {
    return this._settings.autoCompile;
  }

  set autoCompile(autoCompile: boolean) {
    this._settings.autoCompile = autoCompile;
    this.saveSettings();
  }

  get optimize(): boolean {
    return this._settings.optimize;
  }

  set optimize(optimize: boolean) {
    this._settings.optimize = optimize;
    this.saveSettings();
  }

  get compilerVersion(): string {
    return this._compilerVersion;
  }

  get contracts(): ICompilerContract[] {
    return this._latestCompilationResult.contracts;
  }
}
