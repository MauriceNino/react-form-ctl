/**
 * Helper that re-types a type, so that all number values are optional.
 *
 * This is important for the output, so that empty values are not rendered.
 * Otherwise the output could only be '0' which would always render a number.
 */
export type PartialNumberNull<T> = {
	[key in keyof T]: T[key] extends number ? T[key] | null : T[key];
};
