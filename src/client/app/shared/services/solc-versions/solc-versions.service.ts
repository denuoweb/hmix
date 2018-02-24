import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

import { ISolcVersion } from '../../models/solc-version.model';

@Injectable()
export class SolcVersionsService {
  private _baseSolcUrl = 'https://ethereum.github.io/solc-bin/bin/';
  private _defaultVersion: ISolcVersion = {
    name: 'latest local version',
    url: '/ext/soljson.js'
  };
  private _solcVersions: ISolcVersion[] = [];

  constructor(private http: HttpClient) { }

  loadVersions(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getVersions().then((result) => {
        this._solcVersions = result.builds.map((build: any) => {
          return {
            name: build.longVersion,
            url: this._baseSolcUrl + build.path
          };
        }).reverse();
        resolve();
      });
    });
  }

  private getVersions(): Promise<any> {
    return this.http.get('https://ethereum.github.io/solc-bin/bin/list.json')
                    .catch(this.handleError)
                    .toPromise();
  }

  private handleError(err: any) {
    return Observable.throw(err);
  }

  get solcVersions(): ISolcVersion[] {
    return [this._defaultVersion].concat(this._solcVersions);
  }

  get defaultVersion(): ISolcVersion {
    return this._defaultVersion;
  }
}
