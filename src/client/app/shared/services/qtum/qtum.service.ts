import { Injectable } from '@angular/core';

// Models
import { ICompilerContract } from '../../models/compiler-result.model';

// Services
import { StorageService } from '../storage/storage.service';

// Constants
import { STORAGE_KEYS } from '../../constants/storage-keys';

// External imports
import { qtumjs } from '../../globals';

// default to localhost where user will be running a testnet
// currently setup to specifically run on testnet
// TODO implement mainnet functionality

@Injectable()
export class QtumService {
  private _defaultRpcUrl = 'http://qtum:test@localhost:9888';

  constructor(private storageService: StorageService) { }

  get rpcUrl(): string {
    return this.storageService.get(STORAGE_KEYS['rpcUrl']) || this._defaultRpcUrl;
  }

  set rpcUrl(rpcUrl: string) {
    this.storageService.set(STORAGE_KEYS['rpcUrl'], rpcUrl);
  }

  get rpc(): any {
    return new qtumjs.QtumRPC(this.rpcUrl);
  }
}
