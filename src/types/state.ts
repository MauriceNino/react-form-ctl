import {
	OutputErrorsMapType,
	OutputErrorType,
	ValidatorType,
} from './error-handling';
import { PartialNumberNull } from './utility';

/**
 * The input type of the hook
 */
export type FormControlHookInputType<T> = {
	[key in keyof T]: [
		/**
		 * The default value of the form field
		 */
		T[key] extends number ? T[key] | null : T[key],

		/**
		 * An optional list of validators for the form field
		 */
		ValidatorType<T[key], T>[]?
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
 * Represents the current state of the form (including errors)
 */
export type FormCtlHookReturnType<T> = {
	/**
	 * Holds information about all given form controls. This information includes:
	 *
	 * - value (get/set)
	 * - state (valid, touched, dirty, errors, etc.)
	 * - helpers (for input props)
	 */
	controls: {
		[key in keyof T]: {
			/**
			 * The current value of a form control
			 */
			value: T[key] extends number ? T[key] | null : T[key];

			/**
			 * Set the value of a form control
			 */
			setValue: (value: T[key]) => void;

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

			/**
			 * Helper to get the HTML text-input props of a form control.
			 *
			 * @example
			 * ```tsx
			 * <input type="text" {...example.inputProps()} />
			 * ```
			 */
			inputProps: T[key] extends string
				? () => ReactInputPropsType<string>
				: never;

			/**
			 * Helper to get the HTML number-input props of a form control.
			 *
			 * @example
			 * ```tsx
			 * <input type="number" {...example.numberInputProps()} />
			 * ```
			 */
			numberInputProps: T[key] extends number
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
			checkboxProps: T[key] extends boolean
				? () => ReactCheckboxPropsType
				: never;

			/**
			 * Helper to get the React-Native TextInput props of a form control.
			 *
			 * @example
			 * ```tsx
			 * <TextInput {...example.rnInputProps()} />
			 * ```
			 */
			rnInputProps: T[key] extends string
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
			rnNumberInputProps: T[key] extends number
				? () => ReactNativeTextInputPropsType<string>
				: never;
		};
	};

	/**
	 * The current value of the form
	 */
	value: PartialNumberNull<T>;

	/**
	 * Set the value of the form
	 */
	setValue: (value: T) => void;

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
		value: T[key] extends number ? T[key] | null : T[key];
		dirty: boolean;
		touched: boolean;
	};
};
