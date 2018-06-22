import { Injectable } from '@angular/core';

// provides a storage manager to look up key value pairs

@Injectable()
export class StorageService {
  get(key: string): any {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  set(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}
