import { useMemo, useRef, useState } from 'react';
import {
	FormControlHookInputType,
	FormCtlHookReturnType,
	InternalState,
} from './types/state';
import { PartialNumberNull } from './types/utility';
import { getErrorProps } from './validators';

/**
 * A react hook to control form data.
 *
 * @example
 * ```tsx
 * type FormData = {
 *   name: string;
 *   // ...
 * }
 *
 * // Inside component
 * const {controls} = useFormControl<FormData>({
 *   name: ['John', [Validators.required, Validators.minLength(3)]],
 *   // ...
 * });
 *
 * return <>
 *   <input
 *     type="text"
 *     value={controls.name.value}
 *     onChange={(e) => controls.name.setValue(e.target.value)}
 *     onBlur={() => controls.name.markTouched()}
 *   />
 * </>
 * ```
 * @param  {FormControlHookInputType<T>} input the form data with its validators
 * @returns {FormCtlHookReturnType<T>} the form data with its errors and meta information
 */
export const useFormControl = <T>(
	input: FormControlHookInputType<T>
): FormCtlHookReturnType<T> => {
	// Map to internal state and save it
	const internalState = useMemo(() => getInternalState(input), [input]);
	const [state, setState] = useState<InternalState<T>>(internalState);

	// Keep a copy of the initial internal state (used for reset)
	const initialInternalState = useRef(internalState);

	// Map internal state to output state
	const output = getDetailedFormData(input, state, setState);
	const { valid, dirty, touched } = getGlobalState(output);
	const formData = getGlobalFormData(state);

	// Function for updating the whole form at once
	const setValue = (value: T) => {
		setState(() => getInternalStateFromFormData(value));
	};

	// Function for resetting the form
	const reset = () => {
		setState(() => initialInternalState.current);
	};

	return {
		controls: output,
		value: formData,
		setValue,
		reset,

		valid,
		invalid: !valid,

		dirty,
		touched,
	};
};

/**
 * A helper to calculate the global state of the form (valid, dirty, touched).
 */
const getGlobalState = <T>(output: FormCtlHookReturnType<T>['controls']) => {
	const outValues = [];

	for (let key in output) {
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
const getDetailedFormData = <T>(
	input: FormControlHookInputType<T>,
	state: InternalState<T>,
	setState: (updateFunc: (value: InternalState<T>) => InternalState<T>) => void
): FormCtlHookReturnType<T>['controls'] => {
	let output: FormCtlHookReturnType<T>['controls'] = {} as any;
	for (let key in input) {
		const [, validators] = input[key];
		const { value, dirty, touched } = state[key];

		const { errors, errorsMap, hasErrors } = getErrorProps(
			value,
			validators,
			state
		);

		const setValue = (value: any) => {
			setState(oldState => ({
				...oldState,
				[key]: {
					value,
					dirty: oldState[key] !== value,
					touched: true,
				},
			}));
		};

		const markDirty = (value: boolean = true) => {
			setState(oldState => ({
				...oldState,
				[key]: {
					...oldState[key],
					dirty: value,
				},
			}));
		};
		const markTouched = (value: boolean = true) => {
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
				setValue(null);
			} else if (!isNaN(numInput)) {
				setValue(numInput);
			} else {
				markTouched();
			}
		};

		//@ts-ignore
		output[key] = {
			value,
			setValue,

			valid: !hasErrors,
			invalid: hasErrors,

			dirty,
			markDirty,
			touched,
			markTouched,
			touchedOrDirty: dirty || touched,

			error: hasErrors ? errors[0] : undefined,
			errors: hasErrors ? errorsMap : undefined,

			inputProps: () => ({
				value,
				onChange: e => setValue(e.target.value),
				onBlur: () => markTouched(),
			}),

			numberInputProps: () => ({
				value: value == null ? '' : value,
				onChange: e => setNumberValue(e.target.value),
				onBlur: () => markTouched(),
			}),

			checkboxProps: () => ({
				checked: value as any as boolean,
				onChange: () => setValue(!value),
				onBlur: () => markTouched(),
			}),

			rnInputProps: () => ({
				value,
				onChangeText: e => setValue(e),
				onBlur: () => markTouched(),
			}),

			rnNumberInputProps: () => ({
				value: value == null ? '' : '' + value,
				onChangeText: e => setNumberValue(e),
				onBlur: () => markTouched(),
			}),
		};
	}

	return output;
};

/**
 * A helper to calculate the internal state from the hook input.
 */
const getInternalState = <T>(
	input: FormControlHookInputType<T>
): InternalState<T> => {
	let internalState: InternalState<T> = {} as any;

	for (let key in input) {
		const [value] = input[key];

		internalState[key] = {
			value,
			dirty: false,
			touched: false,
		};
	}

	return internalState;
};

/**
 * A helper to calculate the internal state from the form data.
 */
const getInternalStateFromFormData = <T>(input: T): InternalState<T> => {
	let internalState: InternalState<T> = {} as any;

	for (let key in input) {
		const value = input[key];

		internalState[key] = {
			value,
			dirty: true,
			touched: true,
		};
	}

	return internalState;
};

/**
 * A helper to calculate the form data output from the internal state
 */
const getGlobalFormData = <T>(
	input: InternalState<T>
): PartialNumberNull<T> => {
	let formData: PartialNumberNull<T> = {} as any;

	for (let key in input) {
		const value = input[key];

		formData[key] = value.value;
	}

	return formData;
};
