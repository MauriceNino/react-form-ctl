import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	getDetailedFormData,
	getGlobalFormData,
	getGlobalState,
	getInternalState,
	getInternalStateFromFormData,
} from './form-control-state';
import {
	FormControlHookInputType,
	FormControlHookReturnType,
	InternalState,
} from './types/state';
import { PartialNumberNull } from './types/utility';

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
 * @param  {React.DependencyList} dependencies optional list of dependencies
 * @returns {FormControlHookReturnType<T>} the form data with its errors and meta information
 */
export const useFormControl = <T extends object>(
	input: FormControlHookInputType<T>,
	dependencies?: React.DependencyList
): FormControlHookReturnType<T> => {
	const { state, setState, initialState } = useInternalState(input);
	const output = useOutputState(input, state, setState, dependencies);
	const actions = useGlobalActions(initialState, setState);

	return useMemo(
		() => ({
			...output,
			...actions,
		}),
		[output, actions]
	);
};

const useInternalState = <T>(input: FormControlHookInputType<T>) => {
	// Map to internal state and save it
	// Keep a copy of the initial internal state (used for reset)
	const initialInternalState = useRef(
		useMemo(() => getInternalState(input), [input])
	);
	const [state, setState] = useState(initialInternalState.current);

	return { state, setState, initialState: initialInternalState.current };
};

const useOutputState = <T extends object>(
	input: FormControlHookInputType<T>,
	state: InternalState<T>,
	setState: Dispatch<SetStateAction<InternalState<T>>>,
	dependencies?: React.DependencyList
) => {
	const prevControls = useRef<FormControlHookReturnType<T>['controls']>();
	const controls = useMemo(
		() => getDetailedFormData(input, prevControls.current, state, setState),
		// Disabled, because it cant statically verify the dependencies
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[setState, state, ...(dependencies ?? [])]
	);
	useEffect(() => {
		prevControls.current = controls;
	}, [controls]);

	const { valid, dirty, touched } = useMemo(
		() => getGlobalState(controls),
		[controls]
	);

	const value = useMemo(() => getGlobalFormData(state), [state]);

	return {
		controls,
		valid,
		invalid: !valid,
		dirty,
		touched,
		value,
	};
};

const useGlobalActions = <T extends object>(
	initialState: InternalState<T>,
	setState: Dispatch<SetStateAction<InternalState<T>>>
) => {
	const setValue = useCallback(
		(value: PartialNumberNull<T>) => {
			setState(() => getInternalStateFromFormData(value));
		},
		[setState]
	);

	// Function for resetting the form
	const reset = useCallback(() => {
		setState(() => Object.assign({}, initialState));
	}, [initialState, setState]);

	return {
		setValue,
		reset,
	};
};
