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
  private compilerWorkerScriptUrl = '/app/shared/services/compiler/worker.js';
  private webWorker: Worker;
  private syncCompiler: any;
  private _settings: ICompilerSettings;
  private _compilerVersion: string;
  private onCompilerLoaded: EventEmitter<any> = new EventEmitter<any>();
  private onCompilationFinished: EventEmitter<any> = new EventEmitter<any>();
  private _latestCompilationResult: ICompilerResult = {
    errors: [],
    contracts: []
  };

  constructor(private storageService: StorageService,
              private fileService: FileService) {
    this.loadSettings();
  }

  async compile(sources: {
    [fileName: string]: {
      [content: string]: string
    }
  }, retry = true): Promise<ICompilerResult> {
    const compilationPromise = this.useWebWorker ? this.compileWebWorker(sources) : this.compileSync(sources);

    return new Promise<ICompilerResult>((resolve, reject) => {
      compilationPromise.then((result) => {
        if (result.missingInputs) {
          sources = this.gatherImports(sources, result.missingInputs);
          if (retry) {
            this.compile(sources, false).then((result) => {
              resolve(result);
            });
          } else {
            this.parseCompilationResult(result);
            resolve(this._latestCompilationResult)
          }
        } else {
          this.parseCompilationResult(result);
          resolve(this._latestCompilationResult);
        }
      });
    });
  }

  async loadCompiler(): Promise<void> {
    const solcUrl = '/ext/soljson.js';
    return this.useWebWorker ? this.loadWebWorker(solcUrl) : this.loadSync(solcUrl);
  }

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
    this.webWorker.onmessage = (msg) => {
      console.log(msg);
      const data = msg.data;
      switch (data.command) {
        case 'VersionLoaded':
          this.onCompilerLoaded.emit({
            version: data.version
          });
          break;

        case 'CompileResult':
          this.onCompilationFinished.emit(data);
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

  private compileSync(sources: {
    [fileName: string]: {
      [content: string]: string
    }
  }): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const input = compilerInput(sources, this.optimize);
      let missingInputs: any[] = [];
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

  private compileWebWorker(sources: {
    [fileName: string]: {
      [content: string]: string
    }
  }): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const input = compilerInput(sources, this.optimize);
      this.webWorker.postMessage({
        command: 'CompileRequest',
        input: input
      });
      const compilationResultSub = this.onCompilationFinished.subscribe((result: any) => {
        compilationResultSub.unsubscribe();
        resolve(result);
      });
    });
  }

  private gatherImports(sources: {
    [fileName: string]: {
      [content: string]: string
    }
  }, missingFiles: string[] = []): any {
    const importRegex = /^\s*import\s*[\'\"]([^\'\"]+)[\'\"];/g;

    for (const fileName in sources) {
      let match;
      while ((match = importRegex.exec(sources[fileName].content))) {
        let importFilePath = match[1];
        if (importFilePath.startsWith('./')) {
          importFilePath = importFilePath.slice(2);
        }

        if (!missingFiles.includes(importFilePath)) {
          missingFiles.push(importFilePath);
        }
      }
    }

    while (missingFiles.length > 0) {
      const missingFile = missingFiles.pop();
      if (missingFile in sources) {
        continue;
      }

      const foundFile = this.fileService.getFileByName(missingFile);
      if (foundFile) {
        sources[foundFile.name] = {
          content: foundFile.content
        };
      }
    }

    console.log(sources);

    return sources;
  }

  private parseError(error: string): ICompilerError {
    const pattern: any = /(.*?):(\d+):(\d+): (.*?): ([^]+)/g;
    const match = pattern.exec(error);
    return {
      fileName: match[1],
      lineNumber: parseInt(match[2], 10),
      columnNumber: parseInt(match[3], 10),
      errorType: match[4],
      message: match[5]
    };
  }

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

    this._latestCompilationResult.errors = [];
    for (const error of filteredErrors) {
      this._latestCompilationResult.errors.push(this.parseError(error.formattedMessage));
    }
  }

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

  private parseCompilationResult(result: any): void {
    const resultObject = JSON.parse(result.result);
    this.parseContracts(resultObject);
    this.parseErrors(resultObject);
  }

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
}
