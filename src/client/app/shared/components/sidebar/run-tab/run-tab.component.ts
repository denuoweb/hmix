import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// Models
import { ICompilerContract } from '../../../models/index';

// Services
import { CompilerService, QtumService, TerminalService } from '../../../services/index';

// External imports
import { qtumjs } from '../../../globals';

// currently everything is set up to work only on testnet
// TODO add mainnet functionality, connection and deployment of contracts

@Component({
  moduleId: module.id,
  selector: 'sd-run-tab',
  templateUrl: 'run-tab.component.html',
  styleUrls: ['run-tab.component.css']
})
export class RunTabComponent implements OnInit, OnDestroy {
  private _selectedContract: ICompilerContract;
  private _compilationStartedSub: Subscription;
  private _compilationFinishedSub: Subscription;
  private _loadedContracts: any[] = [];
  private _compiling: boolean;
  private _loadingUtxos: boolean;
  private _lastError: string;
  private _utxos: any[] = [];
  private _selectedUtxo: any;
  private _gasLimit = 400000;
  private _txValue = 0;
  private _contractAddress: string;

  constructor(private compilerService: CompilerService,
              private qtumService: QtumService,
              private terminalService: TerminalService) { }


  /*
   * Lifecycle hooks
   * set up compiling subscriptions
   */

  ngOnInit() {
    this.getUtxos();

    this._compiling = true;
    this._compilationStartedSub = this.compilerService.onCompilationStarted.subscribe(() => {
      this._compiling = true;
    });
    this._compilationFinishedSub = this.compilerService.onCompilationFinished.subscribe(() => {
      this._selectedContract = this.contracts[0];
      this._compiling = false;
    });
  }

  ngOnDestroy() {
    // Stop all subscriptions to avoid memory leaks
    this._compilationStartedSub.unsubscribe();
    this._compilationFinishedSub.unsubscribe();
  }


  /*
   * Public functions
   */

  /**
   * Load unspent transaction outputs from qtum testnet
   * to be used for contract transactions
   */
  getUtxos(): void {
    this._loadingUtxos = true;
    this.rpc.rawCall('listunspent').then((result: any) => {
      // Return the 10 largest UTXOs by amount
      const balances: any = {};
      result.forEach((utxo: any) => {
        balances[utxo.address] = (balances[utxo.address] || 0) + utxo.amount;
      });
      const unsortedBalances: any = [];
      for (const address in balances) {
        unsortedBalances[unsortedBalances.length] = {
          address: address,
          amount: balances[address]
        };
      }
      this._utxos = unsortedBalances.sort((a: any, b: any) => {
        return b.amount - a.amount;
      }).slice(0, 10);

      // Select the largest UTXO automatically
      this._selectedUtxo = this._utxos[0];
      this._loadingUtxos = false;
    });
  }

  /**
   * Returns the current selected contract as a formatted Contract object
   * @return A Qtum Contract object with some extra fields
   */
  currentQtumContract(): any {
    // Create a qtumjs Contract object
    const contract = new qtumjs.Contract(this.rpc, {
      abi: this._selectedContract.abi,
      address: this._contractAddress
    });

    // Make sure the Qtum.js Contract object has a name
    contract.name = this._selectedContract.name;
    contract.expanded = true;
    contract.functions = contract.info.abi.filter((method: any) => {
      // Only show functions or the fallback
      return method.type === 'function' || method.type === 'fallback';
    }).map((method: any) => {
      // Give fallback functions a name for display
      if (method.type === 'fallback') { method.name = '(fallback)'; }
      return Object.assign({}, method);
    }).reverse();

    return contract;
  }

  /**
   * Deploys the selected contract
   */
  deploy(): void {
    const contract = this.currentQtumContract();

    const constructorArgs = (<any>this._selectedContract).constructorArgs;
    const args = constructorArgs ? constructorArgs.split(',') : [];
    
    // create variables necessary for transactions
    this.terminalService.log(`Deploying: ${contract.name}`);
    contract.deploy(args, {
      senderAddress: this._selectedUtxo.address,
      bytecode: this._selectedContract.evm.bytecode.object,
      amount: this.txValue,
      gasLimit: this.gasLimit
    }).then((result: any) => {
      this.terminalService.log(`Deployed ${contract.name} @${contract.address}`);
      this._loadedContracts.push(contract);

      // Generate a new block so the contract is mined
      this.rpc.rawCall('generate', [1]).then(() => {
        return this.rpc.rawCall('gettransactionreceipt', [result.txid]);
      }).then((receipt: any) => {
        console.log(receipt);
      });

    }).catch((err: any) => {
      this.terminalService.log(err);
    });
  }

  /**
   * Loads a contract at the specified address
   */
  atAddress(): void {
    const contract = this.currentQtumContract();
    this.terminalService.log(`Loaded ${contract.name} @${contract.address}`);
    this._loadedContracts.push(contract);
  }

  /**
   * Calls or sends to the selected function with the given arguments
   * @param {any} contract The contract instance to transact to
   * @param {any} fn The function to call
   */
  callOrSend(contract: any, fn: any): void {
    const args = fn.args ? fn.args.split(',') : [];

    // Determine the transaction type (call or send)
    let transactionType;
    if (fn.constant) {
      transactionType = contract.call;
    } else {
      transactionType = contract.send;
    }
    // set up loging for the call
    this.terminalService.log(`Calling method: ${fn.name}`);

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
      // We're calling the fallback function
      this.rpc.rawCall('sendtocontract', [
        contract.address,
        '00000000',
        this.txValue,
        this.gasLimit,
        0.0000004,
        this._selectedUtxo.address
      ]).then((tx: any) => {
        this.terminalService.log(`TXID: ${tx.txid}`);

        // Generate a block so this transaction is mined
        this.generateBlocks(1);
      });
    } else {
      // Normal call or send function
      transactionType.call(contract, fn.name, args, {
        senderAddress: this._selectedUtxo.address,
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

        // Generate a block so this transaction is mined
        this.generateBlocks(1);
      }).catch((err: any) => {
        console.log(err);
        this.terminalService.log(err);
      });
    }
  }

  /**
   * Generates some number of blocks on the testnet
   * @param {number} numBlocks Number of blocks to generate
   */
  generateBlocks(numBlocks: number): void {
    this.rpc.rawCall('generate', [numBlocks]).then((result: any) => {
      console.log(result);
    });
  }

  /**
   * Returns the types for each of a function's arguments
   * @param {any} fn Function to return types for
   * @return {string[]} A string array of input types
   */
  getFunctionInputs(fn: any): string[] {
    return fn.inputs.map((input: any) => {
      return input.type;
    });
  }

  /**
   * Removes the selected contract from the list of contracts
   * @param {any} contract Contract to remove
   */
  removeContract(contract: any): void {
    this._loadedContracts = this._loadedContracts.filter((_contract) => {
      return _contract !== contract;
    });
  }

  /**
   * Toggles whether a contract is expanded
   * @param contract Contract to toggle
   */
  toggleExpand(contract: any): void {
    contract.expanded = !contract.expanded;
  }


  /*
   * Public getters/setters
   */

  get constructorInputs(): string[] {
    const constructorMethod = this._selectedContract.abi.find((method: any) => {
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

  // uses qtum js to connect to qtumrpc 
  
  get rpc(): any {
    return new qtumjs.QtumRPC(this.rpcUrl);
  }

  get rpcUrl(): string {
    return this.qtumService.rpcUrl;
  }

  set rpcUrl(rpcUrl: string) {
    this.qtumService.rpcUrl = rpcUrl;
  }

  get loadedContracts(): any[] {
    return this._loadedContracts;
  }

  get selectedContract(): any {
    return this._selectedContract;
  }

  set selectedContract(contract: any) {
    this._selectedContract = contract;
  }

  get compiling(): boolean {
    return this._compiling;
  }

  get lastError(): string {
    return this._lastError;
  }

  get loadingUtxos(): boolean {
    return this._loadingUtxos;
  }

  get utxos(): any[] {
    return this._utxos;
  }

  get selectedUtxo(): any {
    return this._selectedUtxo;
  }

  set selectedUtxo(utxo: any) {
    this._selectedUtxo = utxo;
  }

  get txValue(): number {
    return Number(this._txValue);
  }

  set txValue(txValue: number) {
    this._txValue = txValue;
  }

  get gasLimit(): number {
    return Number(this._gasLimit);
  }

  set gasLimit(gasLimit: number) {
    this._gasLimit = gasLimit;
  }

  get contractAddress(): string {
    return this._contractAddress;
  }

  set contractAddress(address: string) {
    this._contractAddress = address;
  }
}
