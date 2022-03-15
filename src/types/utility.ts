/**
 * Helper that re-types an object type, so that all values can be nullable if
 * they are of type number.
 */
export type PartialNumberNull<T extends object> = {
	[key in keyof T]: NumberNullable<T[key]>;
};

/**
 * Helper that re-types a type, so that it is nullable if it is a number.
 *
 * This is important for the output, so that empty values are not rendered.
 * Otherwise the output could only be '0' which would always render a number.
 */
export type NumberNullable<T> = T extends number ? T | null : T;
