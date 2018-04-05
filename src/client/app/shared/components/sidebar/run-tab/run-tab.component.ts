import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Models
import { ICompilerContract } from '../../../models/compiler-result.model';

// Services
import { CompilerService } from '../../../services/compiler/compiler.service';
import { QtumService } from '../../../services/qtum/qtum.service';
import { TerminalService } from '../../../services/terminal/terminal.service';

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
  private compilationStartedSub: Subscription;
  private compilationFinishedSub: Subscription;
  private _loadedContracts: any[] = [];
  private _compiling = true;
  private _lastError: string;
  private unspent: any[] = [];
  private selectedUtxo: any;
  private gasLimit = 400000;
  private txValue = 0;

  constructor(private compilerService: CompilerService,
              private qtumService: QtumService,
              private terminalService: TerminalService) { }

  ngOnInit() {
    this.getUnspent();
    this.compilationStartedSub = this.compilerService.onCompilationStarted.subscribe(() => {
      this._compiling = true;
    });
    this.compilationFinishedSub = this.compilerService.onCompilationFinished.subscribe(() => {
      this.selectedContract = this.contracts[0];
      this._compiling = false;
    });
  }

  getUnspent(): void {
    this.rpc.rawCall('listunspent').then((result: any) => {
      this.unspent = result.sort((a: any, b: any) => {
        return b.amount - a.amount;
      }).slice(0, 10);
      this.selectedUtxo = this.unspent[0];
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
      // Only show functions or the fallback
      return method.type === 'function' || method.type === 'fallback';
    }).map((method: any) => {
      // Give fallback functions a name for display
      if (method.type === 'fallback') { method.name = '(fallback)'; }
      return Object.assign({}, method);
    }).reverse();

    const args = this.constructorArgs ? this.constructorArgs.split(',') : [];

    this.terminalService.log(`Deploying: ${contract.name} (waiting for approval)`);
    contract.deploy(args, {
      senderAddress: this.selectedUtxo.address,
      bytecode: this.selectedContract.evm.bytecode.object
    }).then((result: any) => {
      this.terminalService.log(`Deployed ${contract.name} @${contract.address}`);
      console.log(contract);
      this._loadedContracts.push(contract);
      this.generateBlocks(1);
    }).catch((err: any) => {
      console.log(err);
      this.terminalService.log(err);
    });
  }

  callOrSend(contract: any, fn: any): void {
    const args = fn.args ? fn.args.split(',') : [];

    let transactionType;
    if (fn.constant) {
      this.terminalService.log(`Calling method: ${fn.name}`);
      transactionType = contract.call;
    } else {
      this.terminalService.log(`Calling method: ${fn.name} (waiting for approval)`);
      transactionType = contract.send;
    }

    const logEvents = (tx: any) => {
      tx.logs.forEach((log: any) => {
        let eventData = '';
        for (const property in log) {
          eventData += '\n' + `${property}: ${log[property]}`;
        }
        this.terminalService.log(`Event Occurred: ${eventData}`);
      });
    };

    if (fn.name === '(fallback)') {
      this.rpc.rawCall('sendtocontract', [
          contract.address,
          '00000000',
          this.txValue,
          this.gasLimit,
          0.0000004,
          this.selectedUtxo.address
        ]).then((tx: any) => {
        this.terminalService.log(`TXID: ${tx.txid}`);
        this.generateBlocks(1);
      });
    } else {
      transactionType.call(contract, fn.name, args, {
        senderAddress: this.selectedUtxo.address,
        amount: this.txValue,
        gasLimit: this.gasLimit
      }).then((tx: any) => {
        if (fn.constant) {
          this.terminalService.log(`Outputs: ${tx.outputs}`);
          logEvents(tx);
        } else {
          this.terminalService.log(`TXID: ${tx.txid}`);
          tx.confirm(1).then((receipt: any) => {
            logEvents(receipt);
          });
        }
        this.generateBlocks(1);
      }).catch((err: any) => {
        console.log(err);
        this.terminalService.log(err);
      });
    }
  }

  generateBlocks(numBlocks: number): void {
    this.rpc.rawCall('generate', [numBlocks]).then((result: any) => {
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

  get compiling(): boolean {
    return this._compiling;
  }

  get lastError(): string {
    return this._lastError;
  }
}
