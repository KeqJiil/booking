import { ValidationError } from 'class-validator';

interface IFlattenError {
  field: string;
  messages: string[];
}

export function exceptionFlattener(
  errs: ValidationError[],
  parent?: string,
): IFlattenError[] {
  const flattenErrs: IFlattenError[] = [];
  for (const err of errs) {
    const messages: string[] = [];
    if (err?.constraints) {
      messages.push(...Object.values(err.constraints));
    }

    if (err?.children) {
      const nestedErr = exceptionFlattener(err?.children, err.property);
      flattenErrs.push(...nestedErr);
    }
    flattenErrs.push({
      messages,
      field: parent ? `${parent}.${err.property}` : err.property,
    });
  }
  return flattenErrs;
}
