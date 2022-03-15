import { Dispatch, SetStateAction } from 'react';
import {
	FormControlHelpers,
	FormControlHookInputType,
	FormControlHookReturnType,
	FormControlState,
	InternalState,
} from './types/state';
import { PartialNumberNull } from './types/utility';
import { getErrorProps } from './validators';

/**
 * A helper to calculate the global state of the form (valid, dirty, touched).
 */
export const getGlobalState = <T extends object>(
	output: FormControlHookReturnType<T>['controls']
) => {
	const outValues = [];

	for (const key in output) {
		outValues.push(output[key]);
	}

	return {
		valid: outValues.every(({ valid }) => valid),
		dirty: outValues.some(({ dirty }) => dirty),
		touched: outValues.some(({ touched }) => touched),
	};
};

/**
 * A helper to calculate the state and value of the form and build the output data.
 */
export const getDetailedFormData = <T extends object>(
	input: FormControlHookInputType<T>,
	state: InternalState<T>,
	setState: Dispatch<SetStateAction<InternalState<T>>>
) => {
	const output: Partial<FormControlHookReturnType<T>['controls']> = {};

	for (const key in input) {
		const [, validators] = input[key];
		const { value, dirty, touched } = state[key];

		const { errors, errorsMap, hasErrors } = getErrorProps(
			value,
			validators,
			state
		);

		const setValue = (v: typeof value) => {
			setState(oldState => ({
				...oldState,
				[key]: {
					value: v,
					dirty: oldState[key].value !== v,
					touched: true,
				},
			}));
		};

		const resetValue = (v: typeof value) => {
			setState(oldState => ({
				...oldState,
				[key]: {
					value: v,
					dirty: false,
					touched: false,
				},
			}));
		};

		const markDirty = (value = true) => {
			setState(oldState => ({
				...oldState,
				[key]: {
					...oldState[key],
					dirty: value,
				},
			}));
		};
		const markTouched = (value = true) => {
			setState(oldState => ({
				...oldState,
				[key]: {
					...oldState[key],
					touched: value,
				},
			}));
		};

		const setNumberValue = (input: string) => {
			const numInput = +input;
			if (input === '') {
				setValue(null as typeof value);
			} else if (!isNaN(numInput)) {
				setValue(numInput as typeof value);
			} else {
				markTouched();
			}
		};

		const outputValues: FormControlState<T[Extract<keyof T, string>]> = {
			value,
			setValue,
			resetValue,

			valid: !hasErrors,
			invalid: hasErrors,

			dirty,
			markDirty,
			touched,
			markTouched,
			touchedOrDirty: dirty || touched,

			error: hasErrors ? errors[0] : undefined,
			errors: hasErrors ? errorsMap : undefined,
		};

		// Lint & Typescript ignored, because we need to append the helpers either way
		// If they are dependent on the input type, we can never be 100% sure which type they are
		const outputHelpers: FormControlHelpers<T[Extract<keyof T, string>]> = {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			inputProps: () => ({
				value,
				onChange: e => setValue(e.target.value as unknown as typeof value),
				onBlur: () => markTouched(),
			}),

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			numberInputProps: () => ({
				value: value == null ? '' : value,
				onChange: e => setNumberValue(e.target.value),
				onBlur: () => markTouched(),
			}),

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			checkboxProps: () => ({
				checked: value,
				onChange: () => setValue(!value as unknown as typeof value),
				onBlur: () => markTouched(),
			}),

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			rnInputProps: () => ({
				value,
				onChangeText: e => setValue(e as unknown as typeof value),
				onBlur: () => markTouched(),
			}),

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			rnNumberInputProps: () => ({
				value: value == null ? '' : '' + value,
				onChangeText: e => setNumberValue(e),
				onBlur: () => markTouched(),
			}),
		};

		output[key] = {
			...outputValues,
			...outputHelpers,
		};
	}

	return output as FormControlHookReturnType<T>['controls'];
};

/**
 * A helper to calculate the internal state from the hook input.
 */
export const getInternalState = <T>(input: FormControlHookInputType<T>) => {
	const internalState: Partial<InternalState<T>> = {};

	for (const key in input) {
		const [value] = input[key];

		internalState[key] = {
			value,
			dirty: false,
			touched: false,
		};
	}

	return internalState as InternalState<T>;
};

/**
 * A helper to calculate the internal state from the form data.
 */
export const getInternalStateFromFormData = <T extends object>(
	input: PartialNumberNull<T>
) => {
	const internalState: Partial<InternalState<T>> = {};

	for (const key in input) {
		const value = input[key];

		internalState[key] = {
			value,
			dirty: true,
			touched: true,
		};
	}

	return internalState as InternalState<T>;
};

/**
 * A helper to calculate the form data output from the internal state
 */
export const getGlobalFormData = <T extends object>(
	input: InternalState<T>
) => {
	const formData: Partial<PartialNumberNull<T>> = {};

	for (const key in input) {
		const value = input[key];

		formData[key] = value.value;
	}

	return formData as PartialNumberNull<T>;
};
