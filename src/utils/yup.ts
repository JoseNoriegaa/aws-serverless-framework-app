// External dependencies
import type { ValidationError } from 'yup';

const formatYupError = (error: ValidationError) => {
  const output: Record<string, string[]> = {};

  error.inner.forEach(field => {
    output[field.path!] = field.errors;
  });

  return output;
}

export default formatYupError;
