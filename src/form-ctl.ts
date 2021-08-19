import { useMemo, useState } from 'react';
import {
	ErrorsMapType,
	ErrorType,
	getErrorProps,
	ValidatorType,
} from './validators';

type PartialNumberNull<T> = {
	[key in keyof T]: T[key] extends number ? T[key] | null : T[key];
};

export type FormCtlHookInputType<T> = {
	[key in keyof T]: [
		T[key] extends number ? T[key] | null : T[key],
		ValidatorType<T[key], T>[]?
	];
};

export type ReactInputPropsType<T> = {
	value: T;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	onBlur: React.FocusEventHandler<HTMLInputElement>;
};

export type ReactCheckboxPropsType = {
	checked: boolean;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	onBlur: React.FocusEventHandler<HTMLInputElement>;
};

export type ReactNativeTextInputPropsType<T> = {
	value: T;
	onChangeText: (value: string) => void;
	onBlur: () => void;
};

export type FormCtlHookReturnType<T> = {
	data: {
		[key in keyof T]: {
			value: T[key] extends number ? T[key] | null : T[key];
			setValue: (value: T[key]) => void;

			valid: boolean;
			invalid: boolean;

			dirty: boolean;
			markDirty: (value?: boolean) => void;
			touched: boolean;
			markTouched: (value?: boolean) => void;
			touchedOrDirty: boolean;

			error?: ErrorType;
			errors?: ErrorsMapType;

			inputProps: T[key] extends string
				? () => ReactInputPropsType<string>
				: never;
			numberInputProps: T[key] extends number
				? () => ReactInputPropsType<number>
				: never;
			checkboxProps: T[key] extends boolean
				? () => ReactCheckboxPropsType
				: never;
			rnInputProps: T[key] extends string
				? () => ReactNativeTextInputPropsType<string>
				: never;
			rnNumberInputProps: T[key] extends number
				? () => ReactNativeTextInputPropsType<string>
				: never;
		};
	};

	value: PartialNumberNull<T>;
	setValue: (value: T) => void;

	valid: boolean;
	invalid: boolean;
	dirty: boolean;
	touched: boolean;
};

export type InternalState<T> = {
	[key in keyof T]: {
		value: T[key] extends number ? T[key] | null : T[key];
		dirty: boolean;
		touched: boolean;
	};
};

export const useFormCtl = <T>(
	input: FormCtlHookInputType<T>
): FormCtlHookReturnType<T> => {
	// Map to internal state and save it
	const internalState = useMemo(() => getInternalState(input), [input]);
	const [state, setState] = useState<InternalState<T>>(internalState);

	// Map internal state to output state
	const output = getDetailedFormData(input, state, setState);
	const { valid, dirty, touched } = getGlobalState(output);
	const formData = getGlobalFormData(state);

	// Function for updating the whole form at once
	const setValue = (value: T) => {
		setState(() => getInternalStateFromFormData(value));
	};

	return {
		data: output,
		value: formData,
		setValue: setValue,

		valid,
		invalid: !valid,

		dirty,
		touched,
	};
};

const getGlobalState = <T>(output: FormCtlHookReturnType<T>['data']) => {
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

const getDetailedFormData = <T>(
	input: FormCtlHookInputType<T>,
	state: InternalState<T>,
	setState: (updateFunc: (value: InternalState<T>) => InternalState<T>) => void
): FormCtlHookReturnType<T>['data'] => {
	let output: FormCtlHookReturnType<T>['data'] = {} as any;
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

const getInternalState = <T>(
	input: FormCtlHookInputType<T>
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
