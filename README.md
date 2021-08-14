[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![npm version](https://img.shields.io/npm/v/react-form-ctl.svg?style=flat)](https://www.npmjs.com/package/react-form-ctl)
[![Build Status](https://drone.mauz.io/api/badges/MauriceNino/react-form-ctl/status.svg)](https://drone.mauz.io/MauriceNino/react-form-ctl)

# React Form Ctl

React Form Ctl is a **simple** and **type-safe** way to handle form values and validation with bot React and React Native. 
It is inspired by Angular's `FormControl` and/or `FormBuilder`.

- Demo: [Click Here to get to the CodeSandbox](https://codesandbox.io/s/keen-wind-ipdmb?file=/src/App.tsx)

## Why use react-form-ctl?

- No runtime dependencies, other than React itself
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
import {useFormCtl} from 'react-form-ctl';

// Inside component
const {data} = useFormCtl<FormData>({
    name: ['John'],
    // ...
});

return <>
    <input
        type="text"
        {...data.name.inputProps}
    />

    {/* ... */}
</>
```

There are a number of input helpers available:

- `inputProps` -> for HTML `input`s
- `checkboxProps` -> for HTML checkbox `input`s
- `rnInputProps` -> for React Native `TextInput`s

Although if you want more granular control, you can do all the state changing by yourself, using the exposed properties:

```tsx
import {useFormCtl, Validators} from 'react-form-ctl';

// Inside component
const {data} = useFormCtl<FormData>({
    name: ['John', [Validators.required, Validators.minLength(3)]],
    // ...
});

return <>
    <input
        type="text"
        value={data.name.value}
        onChange={(e) => data.name.setValue(e.target.value)}
        onBlur={() => data.name.markTouched()}
    />

    {/* ... */}
</>
```

## Error Handling

In case you want to write a more specific error message for different errors, it is recommended to supply a Map with your error messages like in the following example. Note that this will only be applied to the first error supplied by the first failing Validator.

This Error-Map is also a good chance to bring your localized form data in.

```tsx
import {useFormCtl, extError, Validators, ErrorMappingsType} from 'react-form-ctl';

const {data} = useFormCtl<FormData>({
    name: ['John', [Validators.required, Validators.minLength(5)]],
    // ...
});

const errorMap: ErrorMappingsType = {
    required: () => 'Field is required',
    minLength: ({length, expectedLength}) => `Minimum Length: ${length}/${expectedLength}`
};

return <>
    {/* input field */}

    {/* Check if the property contains errors (invalid) 
        + also check if the property has been modified (edited or touched) */}
    { data.name.invalid && (data.name.touched || data.name.dirty) && <div>
        {extError(errorMap, data.name.error)}
    </div>}
</>
```

Alternatively, you can also get all errors manually and implement your own error handling like so:

```tsx
import {useFormCtl, Validators} from 'react-form-ctl';

const {data} = useFormCtl<FormData>({
    name: ['John', [Validators.required, Validators.minLength(5)]],
    // ...
});

return <>
    {/* input field */}

    { data.name.errors?.required && <div>
        Field is required
    </div>}
    { data.name.errors?.minLength && <div>
        Minimum Length: {data.name.errors.minLength.length}/{data.name.errors.minLength.expectedLength}
    </div>}
</>
```

## Validators

There are a number of Validators already included:

- required
- requiredTrue
- minLength
- maxLength
- min
- max
- pattern
- regex (=> alias for pattern)

You can also implement your own validators and pass them to the Validators array:

```tsx
import {useFormCtl, Validators, ValidatorType} from 'react-form-ctl';

// A simple custom validator
const nameNotBlacklisted: ValidatorType = (value: any) => {
    if(['Max', 'Anna'].includes(value)) {
        return {
            name: 'nameNotBlacklisted',
            found: value
        };
    }

    return null;
}

// You can also create parametrized custom validators
const isExactAge: (age: number): ValidatorType => {
    return (value: number) => {
        if (value !== age) {
            return {
                name: 'isExactAge',
                expected: age
            };
        }

        return null;
    };
},

// Then use them like other validators inside your Validators array
const {data} = useFormCtl<FormData>({
    name: ['John', [nameNotBlacklisted]],
    age: [21, [isExactAge(42)]],
    // ...
});

// Don't forget to also write custom error handlers if you want
const errorMap: ErrorMappingsType = {
    nameNotBlacklisted: ({found}) => `Name is blacklisted: ${found}`,
    isExactAge: ({expected}) => `Expected age of ${expected}`
};
```

## API Reference

You will get back an object containing information about the general state of the form and also a more detailed information about each form field:

```tsx
type State = {
	data: {
        [FieldName: string]: { // For each passed field, you get an entry 
                               // in this object with detailed information about it

            // properties are described down below
        }
    };
    value: FormData; // Get the input data as an object
	setValue: (value: FormData) => void; // Update the whole form state at once

    valid: boolean; // If the form passed all Validators
    invalid: boolean; // The opposite of the above

    touched: boolean; // If the form data was set once
    dirty: boolean; // If the form data was updated once
    tod: boolean; // Shorthand for touched || dirty
}
```

For each passed field, you will get back the following:

```tsx
type FieldState = {
    value: FieldType; // The value of the field
    setValue: (value: FieldType) => void; // Callback to set the value of the field

    inputProps: {/* ... */}; // Object containing necessary methods for React input elements to be spread on

    valid: boolean; // If the value passes all Validators
    invalid: boolean; // The opposite of the above

    touched: boolean; // If the value was set once
    markTouched: (value?: boolean) => void; // Set the value to a desired touched state (if no parameter is given, it is set to touched = true)
    dirty: boolean; // If the value was updated once
    markDirty: (value?: boolean) => void; // Set the value to a desired dirty state (if no parameter is given, it is set to dirty = true)
    tod: boolean; // Shorthand for touched || dirty

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