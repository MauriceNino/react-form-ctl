import {useMemo, useState} from 'react';
import { ErrorsMapType, ErrorType, ValidatorType } from "./validators";

export type FormCtlHookInputType<T> = {
	[key in keyof T]: [T[key], ValidatorType[]?];
}

export type FormCtlHookReturnType<T> = {
	data: {
        [key in keyof T]: {
            value: T[key];
            setValue: (value: T[key]) => void;

            valid: boolean;
            dirty: boolean;

            error?: ErrorType;
            errors?: ErrorsMapType;
        };
    };
	updateData: (value: T) => void;

    valid: boolean;
    dirty: boolean;
};

type InternalState<T> = {
    [key in keyof T]: {
        value: T[key];
        dirty: boolean;
    };
}

export const useFormCtl = <T>(
	input: FormCtlHookInputType<T>
): FormCtlHookReturnType<T> => {
    // Map to internal state and save it
    const internalState = useMemo(() => getInternalState(input), [input]);
    const [state, setState] = useState<InternalState<T>>(internalState);
    
    // Map internal state to output state
    const output = getOutputState(input, state, setState);

    // Function for updating the whole form at once
    const updateData = (value: T) => {
        setState(() => getInternalStateFromFormData(value));
    }

    const {valid, dirty} = getGlobalState(output);

    return {
        data: output,
        updateData: updateData,

        valid, 
        dirty
    }
};

const getGlobalState = <T>(
    output: FormCtlHookReturnType<T>['data']
) => {
    const outValues = Object.values(output) as {valid: boolean; dirty: boolean}[];

    return {
        valid: outValues.every(({valid}) => valid),
        dirty: outValues.some(({dirty}) => dirty)
    }
}

const getOutputState = <T>(
    input: FormCtlHookInputType<T>,
    state: InternalState<T>,
    setState: (updateFunc: (value: InternalState<T>) => InternalState<T>) => void,
): FormCtlHookReturnType<T>['data'] => {
    let output: FormCtlHookReturnType<T>['data'] = {} as any;
    for(let key in input) {
        const [,validators] = input[key];
        const {value, dirty} = state[key];

        const {errors, errorsMap, hasErrors} = getErrorProps(value, dirty, validators);
        
        const updateValue = (value: any) => {
            setState(oldState => ({
                ...oldState,
                [key]: {
                    value,
                    dirty: true,
                },
            }));
        }

        //@ts-ignore
        output[key] = {
            value,
            setValue: updateValue,

            valid: !hasErrors,
            dirty: dirty,

            error: hasErrors ? errors[0] : undefined,
            errors: hasErrors ? errorsMap : undefined,
        }
    }

    return output;
}

const getErrorProps = (
    value: any,
    dirty: boolean,
    validators: ValidatorType[] | undefined,
): {
    errors: ErrorType[],
    errorsMap: ErrorsMapType,
    hasErrors: boolean,
} => {
    const errors = validators
        ?.map(validator => validator(value))
        .filter(error => error != null) as ErrorType[]
        || [];
    
    const errorsMap = errors.reduce((acc, error) => {
        acc[error.name] = error;
        return acc;
    }, {} as ErrorsMapType);

    const hasErrors = dirty && errors.length !== 0;

    return {errors, errorsMap, hasErrors};
}

const getInternalState = <T>(input: FormCtlHookInputType<T>): InternalState<T> => {
    let internalState: InternalState<T> = {} as any;

    for (let key in input) {
        const [value] = input[key];

        internalState[key] = {
            value,
            dirty: false,
        }
    }

    return internalState;
}

const getInternalStateFromFormData = <T>(input: T): InternalState<T> => {
    let internalState: InternalState<T> = {} as any;

    for (let key in input) {
        const value = input[key];

        internalState[key] = {
            value,
            dirty: true,
        }
    }

    return internalState;
}