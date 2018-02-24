import { Injectable } from '@angular/core';

// Services
import { StorageService } from '../storage/storage.service';

// Constants
import { STORAGE_KEYS } from '../../constants/storage-keys';

@Injectable()
export class QtumService {
  private _defaultRpcUrl = 'http://qtum:test@localhost:3889';

  constructor(private storageService: StorageService) { }

  get rpcUrl(): string {
    return this.storageService.get(STORAGE_KEYS['rpcUrl']) || this._defaultRpcUrl;
  }

  set rpcUrl(rpcUrl: string) {
    this.storageService.set(STORAGE_KEYS['rpcUrl'], rpcUrl);
  }
}
