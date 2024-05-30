const currentEnv = new Map<string, string | undefined>();

const stubEnv = (variable: string, value: string) => {
  if (!currentEnv.has(variable)) {
    currentEnv.set(variable, process.env[variable])
  }

  process.env[variable] = value;
};

const clearEnvStub = (variable: string) => {
  process.env[variable] = currentEnv.get(variable);
}

const clearAllEnvStubs = () => {
  for (let key of currentEnv.keys()) {
    clearEnvStub(key);
  }
}

export {
  stubEnv,
  clearEnvStub,
  clearAllEnvStubs,
};
