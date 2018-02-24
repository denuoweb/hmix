import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Models
import { ICompilerContract } from '../../../models/compiler-result.model';

// Services
import { CompilerService } from '../../../services/compiler/compiler.service';
import { QtumService } from '../../../services/qtum/qtum.service';

// External imports
import { qtumjs } from '../../../globals';

@Component({
  moduleId: module.id,
  selector: 'sd-run-tab',
  templateUrl: 'run-tab.component.html',
  styleUrls: ['run-tab.component.css']
})
export class RunTabComponent implements OnInit {
  private _constructorArgs: string;
  private selectedContract: ICompilerContract;
  private compilationFinishedSub: Subscription;
  private _loadedContracts: any[] = [];

  constructor(private compilerService: CompilerService,
              private qtumService: QtumService) { }

  ngOnInit() {
    this.compilationFinishedSub = this.compilerService.onCompilationFinished.subscribe(() => {
      this.selectedContract = this.contracts[0];
    });
  }

  deploy(): void {
    const contractInfo = {
      abi: this.selectedContract.abi
    };
    const contract = new qtumjs.Contract(this.rpc, contractInfo);

    // Make sure the Qtum.js Contract object has a name
    contract.name = this.selectedContract.name;
    contract.expanded = true;
    contract.functions = contract.info.abi.filter((method: any) => {
      return method.type === 'function';
    }).map((method: any) => {
      return Object.assign({}, method);
    }).reverse();

    const args = this.constructorArgs ? this.constructorArgs.split(',') : [];

    contract.deploy(args, {
      bytecode: this.selectedContract.evm.bytecode.object
    }).then((result: any) => {
      this._loadedContracts.push(contract);
    });
  }

  callOrSend(contract: any, fn: any): void {
    const args = fn.args ? fn.args.split(',') : [];
    const transactionType = fn.constant ? contract.call : contract.send;
    transactionType.call(contract, fn.name, args).then((result: any) => {
      console.log(result);
    });
  }

  getFunctionInputs(fn: any): string {
    return fn.inputs.map((input: any) => {
      return input.type;
    });
  }

  removeContract(contract: any): void {
    this._loadedContracts = this._loadedContracts.filter((_contract) => {
      return _contract !== contract;
    });
  }

  toggleExpand(contract: any): void {
    contract.expanded = !contract.expanded;
  }

  get constructorInputs(): string[] {
    const constructorMethod = this.selectedContract.abi.find((method: any) => {
      return method.type === 'constructor';
    });
    if (constructorMethod) {
      return constructorMethod.inputs.map((input: any) => {
        return input.type;
      });
    } else {
      return [];
    }
  }

  get contracts(): ICompilerContract[] {
    return this.compilerService.contracts;
  }

  get rpc(): any {
    return new qtumjs.QtumRPC(this.rpcUrl);
  }

  get rpcUrl(): string {
    return this.qtumService.rpcUrl;
  }

  set rpcUrl(rpcUrl: string) {
    this.qtumService.rpcUrl = rpcUrl;
  }

  get constructorArgs(): string {
    return this._constructorArgs;
  }

  set constructorArgs(args: string) {
    this._constructorArgs = args;
  }

  get loadedContracts(): any[] {
    return this._loadedContracts;
  }
}
