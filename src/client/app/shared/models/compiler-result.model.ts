// compilation error message structure
export interface ICompilerError {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  errorType: string;
  message: string;
}
// compiled contract structure
export interface ICompilerContract {
  name: string;
  abi: any;
  evm: any;
}
// result is a list of errors and contracts in compilation
export interface ICompilerResult {
  errors: ICompilerError[];
  contracts: ICompilerContract[];
}
