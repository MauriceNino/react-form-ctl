import {
	OutputErrorsMapType,
	OutputErrorType,
	ValidatorType,
} from './error-handling';
import { NumberNullable, PartialNumberNull } from './utility';

/**
 * The input type of the hook
 */
export type FormControlHookInputType<T> = {
	[key in keyof T]: [
		/**
		 * The default value of the form field
		 */
		NumberNullable<T[key]>,

		/**
		 * An optional list of validators for the form field
		 */
		ValidatorType<NumberNullable<T[key]>, T>[]?
	];
};

// Helpers for input props in the output of the hook
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

/**
 * Represents the current state of a single form field (including errors)
 * and its helpers
 */
export type FormControl<T> = FormControlState<T> & FormControlHelpers<T>;

/**
 * Represents the current state of a single form field (including errors)
 */
export type FormControlState<T> = {
	/**
	 * The current value of a form control
	 */
	value: NumberNullable<T>;

	/**
	 * Set the value of a form control
	 */
	setValue: (value: NumberNullable<T>) => void;

	/**
	 * Set the value of a form control and simultaneously set:
	 *
	 * - touched = false
	 * - dirty = false
	 */
	resetValue: (value: NumberNullable<T>) => void;

	/**
	 * If the current value of the control is valid
	 */
	valid: boolean;

	/**
	 * If the current value of the control is invalid
	 */
	invalid: boolean;

	/**
	 * If the form control has been changed once
	 */
	dirty: boolean;

	/**
	 * Manually set the form control to a desired 'dirty' state
	 */
	markDirty: (value?: boolean) => void;

	/**
	 * If the form control has been touched once (e.g. blur event or user-change)
	 */
	touched: boolean;

	/**
	 * Manually set the form control to a desired 'touched' state
	 */
	markTouched: (value?: boolean) => void;

	/**
	 * If the form control has been touched once or is dirty
	 */
	touchedOrDirty: boolean;

	/**
	 * If there were one or more errors on this form control, this property represents the first one.
	 * If you need more granular control, use the errors property.
	 */
	error?: OutputErrorType;

	/**
	 * All the triggered errors of the form control
	 */
	errors?: OutputErrorsMapType;
};

/**
 * Represents helpers of a single form control
 */
export type FormControlHelpers<T> = {
	/**
	 * Helper to get the HTML text-input props of a form control.
	 *
	 * @example
	 * ```tsx
	 * <input type="text" {...example.inputProps()} />
	 * ```
	 */
	inputProps: T extends string ? () => ReactInputPropsType<string> : never;

	/**
	 * Helper to get the HTML number-input props of a form control.
	 *
	 * @example
	 * ```tsx
	 * <input type="number" {...example.numberInputProps()} />
	 * ```
	 */
	numberInputProps: T extends number
		? () => ReactInputPropsType<number>
		: never;

	/**
	 * Helper to get the HTML checkbox-input props of a form control.
	 *
	 * @example
	 * ```tsx
	 * <input type="checkbox" {...example.checkboxProps()} />
	 * ```
	 */
	checkboxProps: T extends boolean ? () => ReactCheckboxPropsType : never;

	/**
	 * Helper to get the React-Native TextInput props of a form control.
	 *
	 * @example
	 * ```tsx
	 * <TextInput {...example.rnInputProps()} />
	 * ```
	 */
	rnInputProps: T extends string
		? () => ReactNativeTextInputPropsType<string>
		: never;

	/**
	 * Helper to get the React-Native TextInput props (mapped to a number) of a form control.
	 *
	 * @example
	 * ```tsx
	 * <TextInput keyboardType='number-pad' {...example.rnNumberInputProps()} />
	 * ```
	 */
	rnNumberInputProps: T extends number
		? () => ReactNativeTextInputPropsType<string>
		: never;
};

/**
 * Represents the current state of the form (including errors)
 */
export type FormControlHookReturnType<T extends object> = {
	/**
	 * Holds information about all given form controls. This information includes:
	 *
	 * - value (get/set)
	 * - state (valid, touched, dirty, errors, etc.)
	 * - helpers (for input props)
	 */
	controls: {
		[key in keyof T]: FormControl<T[key]>;
	};

	/**
	 * The current value of the form
	 */
	value: PartialNumberNull<T>;

	/**
	 * Set the value of the form
	 */
	setValue: (value: PartialNumberNull<T>) => void;

	/**
	 * Resets the form to the initially passed values
	 */
	reset: () => void;

	/**
	 * If all controls in this form are valid
	 */
	valid: boolean;
	/**
	 * If any of the controls of this form is invalid
	 */
	invalid: boolean;

	/**
	 * If any of the controls of this form is dirty (has been changed once)
	 */
	dirty: boolean;

	/**
	 * If any of the controls of this form has been touched once (e.g. blur event or user-change)
	 */
	touched: boolean;
};

export type InternalState<T> = {
	[key in keyof T]: {
		value: NumberNullable<T[key]>;
		dirty: boolean;
		touched: boolean;
	};
};
