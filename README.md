[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![npm version](https://img.shields.io/npm/v/react-form-ctl.svg?style=flat)](https://www.npmjs.com/package/react-form-ctl)
[![Build Status](https://drone.mauz.io/api/badges/MauriceNino/react-form-ctl/status.svg)](https://drone.mauz.io/MauriceNino/react-form-ctl)

# React Form Ctl

React Form Ctl is a **simple** and **type-safe** way to handle form values and validation with both React and React Native. 
It is inspired by Angulars `FormControl` and/or `FormBuilder`.

- Demo: [Click Here to get to the CodeSandbox](https://codesandbox.io/s/keen-wind-ipdmb?file=/src/App.tsx)

## Why use react-form-ctl?

- No runtime dependencies, only requires React as a peer dependency
- Fully type-safe
- Localization ready (i18n)
- Simple API that will be familiar to Angular developers and easy to learn for React developers
- All state handling is done for you

## Installation

```cli
> npm install react-form-ctl
```

## Basic Usage

A quick example can be as easy as implementing a hook with some initial data and spreading the given properties onto a input element:

```tsx
import {useFormControl} from 'react-form-ctl';

// Inside component
const {controls} = useFormControl<FormData>({
    name: ['John'],
    // ...
});

return <>
    <input
        type="text"
        {...controls.name.inputProps()}
    />

    {/* ... */}
</>
```

There are a number of input helpers available:

- `inputProps` -> for HTML `input`s
- `numberInputProps` -> for HTML `input`s of type number
- `checkboxProps` -> for HTML checkbox `input`s
- `rnInputProps` -> for React Native `TextInput`s
- `rnNumberInputProps` -> for React Native `TextInput`s of type number

Although if you want more granular control, you can do all the state changing by yourself, using the exposed properties:

```tsx
import {useFormControl, Validators} from 'react-form-ctl';

// Inside component
const {controls} = useFormControl<FormData>({
    name: ['John', [Validators.required, Validators.minLength(3)]],
    // ...
});

return <>
    <input
        type="text"
        value={controls.name.value}
        onChange={(e) => controls.name.setValue(e.target.value)}
        onBlur={() => controls.name.markTouched()}
    />

    {/* ... */}
</>
```

## Error Handling

In case you want to write a more specific error message for different errors, it is recommended to supply a Map with your error messages like in the following example. Note that this will only be applied to the first error supplied by the first failing Validator.

This Error-Map is also a good chance to bring your localized form data in.

```tsx
import {useFormControl, extError, Validators, ErrorMappings} from 'react-form-ctl';

const {controls} = useFormControl<FormData>({
    name: ['John', [Validators.required, Validators.minLength(5)]],
    // ...
});

const errorMap: ErrorMappings = {
    required: () => 'Field is required',
    minLength: ({length, expectedLength}) => `Minimum Length: ${length}/${expectedLength}`,
    default: () => 'Unknown error' // Default mapping fires, when no mapping is given for another error
                    // If no default mapping is set, a runtime exception may be thrown for unknown exceptions
};

return <>
    {/* input field */}

    {/* Check if the property contains errors (invalid) 
        + also check if the property has been modified (edited or touched) */}
    { controls.name.invalid && (controls.name.touched || controls.name.dirty) && <div>
        {extError(errorMap, controls.name.error)}
    </div>}
</>
```

Alternatively, you can also get all errors manually and implement your own error handling like so:

```tsx
import {useFormControl, Validators} from 'react-form-ctl';

const {controls} = useFormControl<FormData>({
    name: ['John', [Validators.required, Validators.minLength(5)]],
    // ...
});

return <>
    {/* input field */}

    { controls.name.errors?.required && <div>
        Field is required
    </div>}
    { controls.name.errors?.minLength && <div>
        Minimum Length: {controls.name.errors.minLength.length}/{controls.name.errors.minLength.expectedLength}
    </div>}
</>
```

## Validators

There are a number of Validators already included:

- required
- requiredTrue
- minLength
- maxLength
- numeric
- min
- max
- pattern
- regex (=> alias for pattern)

If you need more validation types (email, phone number, ...), we recommend using the [Validator.js](https://github.com/validatorjs/validator.js) library. 
Check their documentation for more information about the available validators.

```cli
> npm i validator && npm i -D @types/validator
```

You can then implement your own validators and pass them to the Validators array:

```tsx
import {useFormControl, Validators} from 'react-form-ctl';
import isEmail from 'validator/lib/isEmail';

// A simple custom validator
const nameNotBlacklisted = Validators.create<any>(value => {
    if(['Max', 'Anna'].includes(value)) {
        return {
            name: 'nameNotBlacklisted',
            found: value
        };
    }

    return null;
});

// You can also create parametrized custom validators
const isExactAge = Validators.createParametrized<number, number>(age => {
    return value => {
        if (value !== age) {
            return {
                name: 'isExactAge',
                expected: age
            };
        }

        return null;
    };
});

// You can also check against other form values in your validator
const passwordRepeatMatches = Validators.create<string, FormData>((passwordRepeat, state) => {
    if (passwordRepeat !== state.password.value) {
        return {
            name: 'passwordRepeatMatches',
            expected: passwordRepeat
        };
    }

    return null;
});

// You can use the Validator.js library to write your own custom validators
const validateEmail = Validators.create<string>(email => {
	if (!isEmail(email)) {
		return {
			name: 'validateEmail',
		};
	}

	return null;
});

// Then use them like other validators inside your Validators array
const {controls} = useFormControl<FormData>({
    name: ['John', [nameNotBlacklisted]],
    age: [21, [isExactAge(42)]],
    password: [''],
    passwordRepeat: ['', [passwordRepeatMatches],
    email: ['test@example.com', [validateEmail]]
    // ...
});

// Don't forget to also write custom error handlers if you want
const errorMap: ErrorMappings = {
    nameNotBlacklisted: ({found}) => `Name is blacklisted: ${found}`,
    isExactAge: ({expected}) => `Expected age of ${expected}`,
    passwordRepeatMatches: () => `Password does not match`,
    validateEmail: () => `Email invalid`,
    default: () => 'Unknown error'
};
```

## API Reference

You will get back an object containing information about the general state of the form and also a more detailed information about each form field:

```ts
type State = {
	controls: {
        [FieldName: string]: { // For each passed field, you get an entry 
                               // in this object with detailed information about it

            // properties are described down below
        }
    };
    value: FormData; // Get the input data as an object
	setValue: (value: FormData) => void; // Update the whole form state at once
    reset: () => void; // Reset the form to the initial values

    valid: boolean; // If the form passed all Validators
    invalid: boolean; // The opposite of the above

    touched: boolean; // If the form data was set once
    dirty: boolean; // If the form data was updated once
    tod: boolean; // Shorthand for touched || dirty
}
```

For each passed field, you will get back the following:

```ts
type FieldState = {
    value: FieldType; // The value of the field
    setValue: (value: FieldType) => void; // Callback to set the value of the field

    valid: boolean; // If the value passes all Validators
    invalid: boolean; // The opposite of the above

    touched: boolean; // If the value was set once
    markTouched: (value?: boolean) => void; // Set the value to a desired touched state (if no parameter is given, it is set to touched = true)
    dirty: boolean; // If the value was updated once
    markDirty: (value?: boolean) => void; // Set the value to a desired dirty state (if no parameter is given, it is set to dirty = true)
    touchedOrDirty: boolean; // Shorthand for touched || dirty

    error?: { 
        name: string; // name of the error (e.g. 'required')
        // more custom error properties
    };
    errors?: {
        [ErrorName: string]: { // the property name is the name of the error (e.g. required)
            name: string; // name of the error (e.g. 'required')
            // more custom error properties
        }
    };
}
```

**dirty vs touched**

Dirty means that the value of a property has updated once.
Touched means that the value of a property was tried to be updated once, but not necessarily has been.

A common use-case for those properties is error-handling. An error for a value should mostly only be shown, if the value is invalid AND was already changed once, or the input field has been focused and unfocused again. To implement this, you would have to write:

```ts
if (somefield.invalid && (somefield.touched || somefield.dirty)) { /* ... */ }
```

Because this is so common, react-form-ctl has implemented a little shortcut for that:

```ts
if (somefield.invalid && somefield.touchedOrDirty) { /* ... */ }
```