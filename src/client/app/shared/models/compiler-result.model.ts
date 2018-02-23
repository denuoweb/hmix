export interface ICompilerError {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  errorType: string;
  message: string;
}

export interface ICompilerContract {
  name: string;
  abi: any[];
  evm: any[];
}

export interface ICompilerResult {
  errors: ICompilerError[];
  contracts: ICompilerContract[];
}
