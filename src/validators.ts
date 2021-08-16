import { InternalState } from './form-ctl';

export type ValidatorType<V = any, T = any> = (
	value: V,
	internalState: InternalState<T>
) => ErrorType | null;

export const Validators = {
	required: (value: any) => {
		if (value == null || value === '' || value === false) {
			return {
				name: 'required',
				got: value,
			};
		}

		return null;
	},
	requiredTrue: (value: any) => {
		if (value !== true) {
			return {
				name: 'requiredTrue',
				got: value,
			};
		}

		return null;
	},
	minLength: (length: number) => {
		return (value: string) => {
			if (value.length < length) {
				return {
					name: 'minLength',
					got: value,
					length: value.length,
					expectedLength: length,
				};
			}

			return null;
		};
	},
	maxLength: (length: number) => {
		return (value: string) => {
			if (value.length > length) {
				return {
					name: 'maxLength',
					got: value,
					length: value.length,
					expectedLength: length,
				};
			}

			return null;
		};
	},
	min: (min: number) => {
		return (value: number) => {
			if (value < min) {
				return {
					name: 'min',
					got: value,
					expected: min,
				};
			}

			return null;
		};
	},
	max: (max: number) => {
		return (value: number) => {
			if (value > max) {
				return {
					name: 'max',
					got: value,
					expected: max,
				};
			}

			return null;
		};
	},
	pattern: (pattern: RegExp) => {
		return (value: string) => {
			const match = value.match(pattern);
			if (!(match && value === match[0])) {
				return {
					name: 'pattern',
					got: value,
				};
			}

			return null;
		};
	},
	regex: function (pattern: RegExp) {
		return this.pattern(pattern);
	},
	create: <V, T = any>(validator: ValidatorType<V, T>) => {
		return validator;
	},
	createParametrized: <P, V, T = any>(
		validator: (value: P) => ValidatorType<V, T>
	) => {
		return validator;
	},
};

type ValidatorsMapType = Omit<typeof Validators, 'create' | 'createParam'>;
// prettier-ignore
export type ErrorMappingsType = {
	[errorName in keyof Omit<ValidatorsMapType, 'required' | 'requiredTrue'>]?: (
		values: NonNullable<ReturnType<ReturnType<ValidatorsMapType[errorName]>>>
	) => string;
} & {
	[errorName in keyof Pick<ValidatorsMapType, 'required' | 'requiredTrue'>]?: (
		values: NonNullable<ReturnType<ValidatorsMapType[errorName]>>
	) => string;
} & {
	[prop: string]: (values: any) => string;
};

export type ErrorType = {
	name: keyof ValidatorsMapType | string;
	got?: any;
	expected?: any;
	[prop: string]: any;
};
export type ErrorsMapType = {
	[prop in keyof ValidatorsMapType | string]: {
		[prop: string]: any;
	};
};

export const extError = (
	map: ErrorMappingsType,
	error: ErrorType | undefined
): string => {
	if (!error) {
		return '';
	}

	const mappedError = map[error.name];
	return mappedError(error);
};

export const getErrorProps = <T>(
	value: any,
	validators: ValidatorType<any, T>[] | undefined,
	internalState: InternalState<T>
): {
	errors: ErrorType[];
	errorsMap: ErrorsMapType;
	hasErrors: boolean;
} => {
	const errors =
		(validators
			?.map(validator => validator(value, internalState))
			.filter(error => error != null) as ErrorType[]) || [];

	const errorsMap = errors.reduce((acc, error) => {
		acc[error.name] = error;
		return acc;
	}, {} as ErrorsMapType);

	const hasErrors = errors.length !== 0;

	return { errors, errorsMap, hasErrors };
};
