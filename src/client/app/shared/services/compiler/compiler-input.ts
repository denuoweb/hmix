export const compilerInput = (sources: any, optimize: boolean = false, libraries: any = {}): string => {
  return JSON.stringify({
    language: 'Solidity',
    sources: sources,
    settings: {
      optimizer: {
        enabled: optimize,
        runs: 200
      },
      libraries: libraries,
      outputSelection: {
        '*': {
          '': [ 'legacyAST' ],
          '*': [
            'abi',
            'metadata',
            'evm.legacyAssembly',
            'evm.bytecode',
            'evm.deployedBytecode',
            'evm.methodIdentifiers',
            'evm.gasEstimates'
          ]
        }
      }
    }
  });
};
