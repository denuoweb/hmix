import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

import { ISolcVersion } from '../../models/solc-version.model';

// uses etheruems solidty
// construct base urls to be able to get appropriate versions
// default uses latest version
@Injectable()
export class SolcVersionsService {
  private _baseSolcUrl = 'https://ethereum.github.io/solc-bin/bin/';
  private _defaultVersion: ISolcVersion = {
    name: 'bundled version',
    url: '/ext/soljson-v0.4.25.js'
  };
  private _solcVersions: ISolcVersion[] = [];

  constructor(private http: HttpClient) { }

  // from solidity info json get name and url of solidity versions
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

  // returns information on all released versions of solidity
  private getVersions(): Promise<any> {
    return this.http.get('https://ethereum.github.io/solc-bin/bin/list.json')
                    .catch(this.handleError)
                    .toPromise();
  }

  private handleError(err: any) {
    return Observable.throw(err);
  }
  // all available versions
  get solcVersions(): ISolcVersion[] {
    return [this._defaultVersion].concat(this._solcVersions);
  }
  //default latest version
  get defaultVersion(): ISolcVersion {
    return this._defaultVersion;
  }
}
