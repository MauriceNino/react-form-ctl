import { Validators } from '../validators';
import { InternalState } from './state';

/**
 * Type of a validator (with its optional parameters already resolved)
 */
export type ValidatorType<V = unknown, T = unknown> = (
	value: V,
	internalState: InternalState<T>
) => OutputErrorType | undefined;

/**
 * The return type of a Validator in case of an error.
 *
 * Must at least have a name property. All internal Validators also provide a got and a expected property.
 * For custom Validators, you can provide as many properties as you want, just the name property is required.
 */
export type OutputErrorType = {
	name: keyof ValidatorsMapType | string;
	got?: unknown;
	expected?: unknown;
	[prop: string]: unknown;
};

/**
 * A map of all errors and their corresponding properties.
 * Can be used for more granular control over the error messages.
 */
export type OutputErrorsMapType = {
	[prop in keyof ValidatorsMapType | string]: {
		[prop: string]: unknown;
	};
};

/**
 * Type of the internal validators (without the helper functions create & createParametrized)
 */
type ValidatorsMapType = Omit<
	typeof Validators,
	'create' | 'createParametrized' | 'if'
>;

/**
 * Validators that are not parametrized
 */
type SingleDepthValidators = 'required' | 'requiredTrue' | 'numeric';

// prettier-ignore
/**
 * Typing for the map of error messages, that can be given to the {@link extError} function.
 *
 * @example
 * ```ts
 * const errorMap: ErrorMappings = {
 *   required: () => 'Field is required',
 *   minLength: ({length, expectedLength}) => `Minimum Length: ${length}/${expectedLength}`,
 *   default: () => 'Unknown error'
 * };
 * ```
 */
export type ErrorMappings = {
	[errorName in keyof Omit<ValidatorsMapType, SingleDepthValidators>]?: (
		values: NonNullable<ReturnType<ReturnType<ValidatorsMapType[errorName]>>>
	) => string;
} & {
	[errorName in keyof Pick<ValidatorsMapType, SingleDepthValidators>]?: (
		values: NonNullable<ReturnType<ValidatorsMapType[errorName]>>
	) => string;
} & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	default?: (values: any) => string;
} & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[prop: string]: (values: any) => string;
};
