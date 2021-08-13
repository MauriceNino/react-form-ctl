export type CommonErrorTypes = "required" | "minLength" | "maxLength";
export type ErrorType = {
  name: CommonErrorTypes | string;
  [prop: string]: any;
};
export type ErrorsMapType = {
  [prop in CommonErrorTypes | string]: {
    [prop: string]: any;
  };
};

export type ValidatorType = (value: any) => ErrorType | null;

const requiredValidator: ValidatorType = (value: any) => {
  if (value == null || value === "" || value === false) {
    return {
      name: "required",
      got: value,
    };
  }

  return null;
};

const requiredTrueValidator: ValidatorType = (value: any) => {
  if (value !== true) {
    return {
      name: "requiredTrue",
      got: value,
    };
  }

  return null;
};

export const Validators = {
  required: requiredValidator,
  requiredTrue: requiredTrueValidator,
  minLength: (length: number): ValidatorType => {
    return (value: string) => {
      if (value.length < length) {
        return {
          name: "minLength",
          got: value,
          length: value.length,
          expectedLength: length,
        };
      }

      return null;
    };
  },
  maxLength: (length: number): ValidatorType => {
    return (value: string) => {
      if (value.length > length) {
        return {
          name: "maxLength",
          got: value,
          length: value.length,
          expectedLength: length,
        };
      }

      return null;
    };
  },
  min: (min: number): ValidatorType => {
    return (value: number) => {
      if (value < min) {
        return {
          name: "min",
          got: value,
          expected: min,
        };
      }

      return null;
    };
  },
  max: (max: number): ValidatorType => {
    return (value: number) => {
      if (value > max) {
        return {
          name: "max",
          got: value,
          expected: max,
        };
      }

      return null;
    };
  },
  pattern: (pattern: RegExp): ValidatorType => {
    return (value: string) => {
      const match = value.match(pattern);
      if (!(match && value === match[0])) {
        return {
          name: "pattern",
          got: value,
        };
      }

      return null;
    };
  },
  regex: function (pattern: RegExp) {
    return this.pattern(pattern);
  },
};

export type ErrorMappingsType = {
  [key in CommonErrorTypes | string]: (error: ErrorType) => void;
};

export const extError = (map: ErrorMappingsType, error: ErrorType) => {
  if (!error) {
    return "";
  }

  const mappedError = map[error.name];
  return mappedError(error);
};

export const getErrorProps = (
  value: any,
  validators: ValidatorType[] | undefined
): {
  errors: ErrorType[];
  errorsMap: ErrorsMapType;
  hasErrors: boolean;
} => {
  const errors =
    (validators
      ?.map((validator) => validator(value))
      .filter((error) => error != null) as ErrorType[]) || [];

  const errorsMap = errors.reduce((acc, error) => {
    acc[error.name] = error;
    return acc;
  }, {} as ErrorsMapType);

  const hasErrors = errors.length !== 0;

  return { errors, errorsMap, hasErrors };
};
