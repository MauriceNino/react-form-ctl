import {
	ErrorMappings,
	OutputErrorsMapType,
	OutputErrorType,
	ValidatorType,
} from './types/error-handling';
import { InternalState } from './types/state';

/**
 * Holds validators for form values, as well as helpers to create your own validators.
 */
export const Validators = {
	/**
	 * Validate that a form value is present (not null/undefined, not empty string, not false).
	 */
	required: (value: any) => {
		if (value == null || value === '' || value === false) {
			return {
				name: 'required',
				got: value,
			};
		}
	},

	/**
	 * Validate that a form value is exactly the value 'true'.
	 */
	requiredTrue: (value: any) => {
		if (value !== true) {
			return {
				name: 'requiredTrue',
				got: value,
			};
		}
	},

	/**
	 * Validate that a forms string value is >= the given length
	 *
	 * @param  {number} length minimum length of the string
	 */
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
		};
	},

	/**
	 * Validate that a forms string value is <= the given length
	 *
	 * @param  {number} length maximum length of the string
	 */
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
		};
	},

	/**
	 * Validate that a form value can be parsed to a number.
	 */
	numeric: (value: any) => {
		if (isNaN(+value)) {
			return {
				name: 'numeric',
				got: value,
			};
		}
	},

	/**
	 * Validate that a forms number value is <= the given minimum.
	 *
	 * @param  {number} min minimum value
	 */
	min: (min: number) => {
		return (value: number) => {
			if (value < min) {
				return {
					name: 'min',
					got: value,
					expected: min,
				};
			}
		};
	},

	/**
	 * Validate that a forms number value is >= the given maximum.
	 *
	 * @param  {number} max maximum value
	 */
	max: (max: number) => {
		return (value: number) => {
			if (value > max) {
				return {
					name: 'max',
					got: value,
					expected: max,
				};
			}
		};
	},

	/**
	 * Validate that a forms string value matches the given regex.
	 *
	 * @param  {RegExp} pattern the regex pattern to match
	 */
	regex: (pattern: RegExp) => {
		return (value: string) => {
			const match = value.match(pattern);
			if (!(match && value === match[0])) {
				return {
					name: 'pattern',
					got: value,
				};
			}
		};
	},

	// Helpers

	/**
	 * A helper function that creates a validator that only runs if a condition is fulfilled.
	 *
	 * Note that any variable used in the condition must also be provided in the dependency array of
	 * the useFormControl Hook, otherwise it wont update on changes.
	 *
	 * @example
	 * ```ts
	 * const loggedIn = ...;
	 *
	 * const {controls} = useFormControl<FormData>({
	 *   name: ['John', [
	 *     Validators.if(() => loggedIn, [Validators.required, Validators.minLength(3)])
	 *   ],
	 *   // ...
	 * }, [loggedIn]);
	 * ```
	 *
	 * @param  {Function} condition the condition (must return a boolean)
	 * @param  {ValidatorType<V,T>} validator the validator (typically an arrow function)
	 * @typeParam V Type of the given form value (e.g string, number, ...)
	 * @typeParam T Type of the form (e.g your input type)
	 */
	if: <V, T = any>(
		condition: (value: V, internalState: InternalState<T>) => boolean,
		validators: ValidatorType<V, T>[]
	) => {
		return Validators.create<V, T>((value, internalState) => {
			if (condition(value, internalState)) {
				let error: OutputErrorType | undefined = undefined;

				validators.some(v => (error = v(value, internalState)) !== undefined);

				return error;
			}
		});
	},

	/**
	 * A helper function that creates type safe validators for the further usage in your forms.
	 *
	 * @example
	 * ```ts
	 * const passwordRepeatMatches = Validators.create((passwordRepeat: string, state: InternalState<FormData>) => {
	 *   if (passwordRepeat !== state.password.value) {
	 *     return {
	 *       name: 'passwordRepeatMatches',
	 *     	 expected: passwordRepeat
	 *     };
	 *   }
	 * });
	 * ```
	 *
	 * @param  {ValidatorType<V,T>} validator the validator (typically an arrow function)
	 * @typeParam V Type of the given form value (e.g string, number, ...)
	 * @typeParam T Type of the form (e.g your input type)
	 */
	create: <V, T = any>(validator: ValidatorType<V, T>) => {
		return validator;
	},

	/**
	 * A helper function that creates type safe parametrized validators for the further usage in your forms.
	 *
	 * @example
	 * ```ts
	 * const isExactAge = Validators.createParametrized((age: number) =>
	 *   Validators.create((value: number) => {
	 *     if (value !== age) {
	 *       return {
	 *         name: 'isExactAge',
	 *         expected: age
	 *       };
	 *     }
	 *   }));
	 * ```
	 *
	 * @param  {ValidatorType<V,T>} validator the validator (typically a result of Validators.create(...))
	 * @typeParam P Type of the parameter value (e.g string, number, ...)
	 * @typeParam V Type of the given form value (e.g string, number, ...)
	 * @typeParam T Type of the form (e.g your input type)
	 */
	createParametrized: <P>(validator: (value: P) => ValidatorType) => {
		return validator;
	},
};

/**
 * Extracts the error message from the given error object using the given error mappings.
 *
 * @param  {ErrorMappings} map the map of error messages of type {@link ErrorMappings}
 * @param  {OutputErrorType|undefined} error the current error, from which the error message is extracted
 * @returns string
 */
export const extError = (
	map: ErrorMappings,
	error: OutputErrorType | undefined
): string => {
	if (!error) {
		return '';
	}

	const mappedError = map[error.name] || map['default'];

	if (!mappedError) {
		throw new Error(
			`No error-mapping specified for error type "${error.name}"`
		);
	}

	return mappedError(error);
};

/**
 * extracts the errors from the given value, by checking the given validators
 *
 * @param  {any} value
 * @param  {ValidatorType<any, T>[] | undefined} validators
 * @param  {InternalState<T>} internalState
 * @returns error information
 */
export const getErrorProps = <T>(
	value: any,
	validators: ValidatorType<any, T>[] | undefined,
	internalState: InternalState<T>
): {
	errors: OutputErrorType[];
	errorsMap: OutputErrorsMapType;
	hasErrors: boolean;
} => {
	const errors =
		(validators
			?.map(validator => validator(value, internalState))
			.filter(error => error != null) as OutputErrorType[]) || [];

	const errorsMap = errors.reduce((acc, error) => {
		acc[error.name] = error;
		return acc;
	}, {} as OutputErrorsMapType);

	const hasErrors = errors.length !== 0;

	return { errors, errorsMap, hasErrors };
};
