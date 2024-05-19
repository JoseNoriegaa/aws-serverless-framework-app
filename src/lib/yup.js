const formatError = (error) => {
  if (Array.isArray(error.inner)) {
    const output = {};

    error.inner.forEach(x => {
      output[x.path] = x.errors;
    });

    return output
  }

  return null;
};

module.exports = { formatError };
