// compiler helper script connects to solc compiler to help compile files

let missingInputs = [];

let compile = () => { return '' };

onmessage = (msg) => {
  const data = msg.data;
  switch (data.command) {
    case 'LoadVersion':
      delete self.Module;
      self.module = undefined;

      self.importScripts('/ext/solc.bundle.js');
      const solc = self.solcWrapper;

      self.importScripts(data.solcUrl);

      const compiler = solc(self.Module);

      compile = (input) => {
        return compiler.compileStandardWrapper(input, (path) => {
          missingInputs.push(path);
          return {
            error: 'Deferred import'
          };
        });
      };

      self.postMessage({
        command: 'VersionLoaded',
        version: compiler.version()
      });

      break;

    case 'CompileRequest':
      missingInputs.length = 0;
      const result = compile(data.input);
      self.postMessage({
        command: 'CompileResult',
        result: result,
        missingInputs: missingInputs
      });

      break;
  }
};
