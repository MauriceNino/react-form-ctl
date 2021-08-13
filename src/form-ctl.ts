import { useMemo, useState } from 'react';
import {
	ErrorsMapType,
	ErrorType,
	getErrorProps,
	ValidatorType,
} from './validators';

export type FormCtlHookInputType<T> = {
	[key in keyof T]: [T[key], ValidatorType[]?];
};

export type FormCtlHookReturnType<T> = {
	data: {
		[key in keyof T]: {
			value: T[key];
			setValue: (value: T[key]) => void;

			valid: boolean;
			invalid: boolean;
			dirty: boolean;

			error?: ErrorType;
			errors?: ErrorsMapType;
		};
	};

	value: T;
	setValue: (value: T) => void;

	valid: boolean;
	invalid: boolean;
	dirty: boolean;
};

export type InternalState<T> = {
	[key in keyof T]: {
		value: T[key];
		dirty: boolean;
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
	const { valid, dirty } = getGlobalState(output);
	const formData = getGlobalFormData(state);

	// Function for updating the whole form at once
	const setValue = (value: T) => {
		setState(() => getInternalStateFromFormData(value));
	};

	return {
		data: output,
		value: formData,
		setValue: setValue,

		valid: valid,
		invalid: !valid,
		dirty: dirty,
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
		const { value, dirty } = state[key];

		const { errors, errorsMap, hasErrors } = getErrorProps(value, validators);

		const updateValue = (value: any) => {
			setState(oldState => ({
				...oldState,
				[key]: {
					value,
					dirty: true,
				},
			}));
		};

		output[key] = {
			value,
			setValue: updateValue,

			valid: !hasErrors,
			invalid: hasErrors,
			dirty: dirty,

			error: hasErrors ? errors[0] : undefined,
			errors: hasErrors ? errorsMap : undefined,
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
		};
	}

	return internalState;
};

const getGlobalFormData = <T>(input: InternalState<T>): T => {
	let formData: T = {} as any;

	for (let key in input) {
		const value = input[key];

		formData[key] = value.value;
	}

	return formData;
};
