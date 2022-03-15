import { expect } from 'chai';
import {
	ErrorMappings,
	OutputErrorType,
	ValidatorType,
} from '../src/types/error-handling';
import { InternalState } from '../src/types/state';
import { extError, getErrorProps, Validators } from '../src/validators';

describe('validators', () => {
	describe('.Validators', () => {
		describe('#required', () => {
			it('should get error if empty, false or null/undefined', () => {
				expect(Validators.required(null)).to.not.be.undefined;
				expect(Validators.required(undefined)).to.not.be.undefined;
				expect(Validators.required('')).to.not.be.undefined;
				expect(Validators.required(false)).to.not.be.undefined;
			});
			it('should work if non-empty or true', () => {
				expect(Validators.required('TEST')).to.be.undefined;
				expect(Validators.required('null')).to.be.undefined;
				expect(Validators.required('false')).to.be.undefined;
				expect(Validators.required('0')).to.be.undefined;
				expect(Validators.required([])).to.be.undefined;
				expect(Validators.required({})).to.be.undefined;
				expect(Validators.required(true)).to.be.undefined;
			});
		});

		describe('#requiredTrue', () => {
			it('should get error if not true', () => {
				expect(Validators.requiredTrue('true')).to.not.be.undefined;
				expect(Validators.requiredTrue(undefined)).to.not.be.undefined;
				expect(Validators.requiredTrue(false)).to.not.be.undefined;
			});
			it('should work if true', () => {
				expect(Validators.requiredTrue(true)).to.be.undefined;
			});
		});

		describe('#minLength', () => {
			it('should get error if too short', () => {
				expect(Validators.minLength(5)('TEST')).to.not.be.undefined;
			});
			it('should work if long enough', () => {
				expect(Validators.minLength(5)('TESTTEST')).to.be.undefined;
				expect(Validators.minLength(4)('1234')).to.be.undefined;
				expect(Validators.minLength(-1)('')).to.be.undefined;
			});
		});

		describe('#maxLength', () => {
			it('should get error if too long', () => {
				expect(Validators.maxLength(3)('TEST')).to.not.be.undefined;
				expect(Validators.maxLength(-1)('')).to.not.be.undefined;
			});
			it('should work if long enough', () => {
				expect(Validators.maxLength(5)('TEST')).to.be.undefined;
				expect(Validators.maxLength(4)('1234')).to.be.undefined;
			});
		});

		describe('#numeric', () => {
			it('should get error if not numeric', () => {
				expect(Validators.numeric('test')).to.not.be.undefined;
				expect(Validators.numeric({ num: 1 })).to.not.be.undefined;
			});
			it('should work if numeric', () => {
				expect(Validators.numeric(1)).to.be.undefined;
				expect(Validators.numeric(-1)).to.be.undefined;
				expect(Validators.numeric(-1.123)).to.be.undefined;
				expect(Validators.numeric('1')).to.be.undefined;
				expect(Validators.numeric('-1')).to.be.undefined;
				expect(Validators.numeric('12e3')).to.be.undefined;
				expect(Validators.numeric('12.123')).to.be.undefined;
			});
		});

		describe('#min', () => {
			it('should get error if too small', () => {
				expect(Validators.min(5)(4)).to.not.be.undefined;
				expect(Validators.min(4)(-1)).to.not.be.undefined;
			});
			it('should work if big enough', () => {
				expect(Validators.min(5)(5)).to.be.undefined;
				expect(Validators.min(5)(6)).to.be.undefined;
				expect(Validators.min(-1)(4)).to.be.undefined;
			});
		});

		describe('#max', () => {
			it('should get error if too big', () => {
				expect(Validators.max(5)(6)).to.not.be.undefined;
				expect(Validators.max(-1)(5)).to.not.be.undefined;
			});
			it('should work if small enough', () => {
				expect(Validators.max(5)(5)).to.be.undefined;
				expect(Validators.max(5)(4)).to.be.undefined;
				expect(Validators.max(4)(-1)).to.be.undefined;
			});
		});

		describe('#pattern/regex', () => {
			it('should get error if regex mismatches', () => {
				expect(Validators.regex(/[A-Z]*/)('ABCD123')).to.not.be.undefined;
				expect(Validators.regex(/[A-Z]*/)('123123')).to.not.be.undefined;
			});
			it('should work if regex matches', () => {
				expect(Validators.regex(/[A-Z]*/)('ABCDEFG')).to.be.undefined;
				expect(Validators.regex(/[A-Z]*/)('')).to.be.undefined;
			});
		});
	});

	describe('#getErrorProps', () => {
		it('should get no error if no validator fails', () => {
			const errors = getErrorProps('TEST', [Validators.required], {});

			expect(errors).to.contain.all.keys('errors', 'errorsMap', 'hasErrors');
			expect(errors.hasErrors).to.be.false;
			expect(errors.errors).to.deep.equal([]);
			expect(errors.errorsMap).to.deep.equal({});
		});

		it('should work with custom validator', () => {
			const isTest: ValidatorType<string> = value => {
				if (value !== 'TEST') {
					return {
						name: 'isTest',
						got: value,
					};
				}
			};

			const errors = getErrorProps('TEST', [isTest], {});
			expect(errors.hasErrors).to.be.false;
			const errors2 = getErrorProps('INVALID', [isTest], {});
			expect(errors2.hasErrors).to.be.true;
		});

		it('should work with custom parametrized validator', () => {
			const is =
				(isVal: string): ValidatorType<string> =>
				value => {
					if (value !== isVal) {
						return {
							name: 'is',
							got: value,
						};
					}
				};

			const errors = getErrorProps('TEST', [is('TEST')], {});
			expect(errors.hasErrors).to.be.false;
			const errors2 = getErrorProps('INVALID', [is('TEST')], {});
			expect(errors2.hasErrors).to.be.true;
		});

		it('should work with custom validator through #create', () => {
			const isTest = Validators.create((value: string) => {
				if (value !== 'TEST') {
					return {
						name: 'isTest',
					};
				}
			});

			const errors = getErrorProps('TEST', [isTest], {});
			expect(errors.hasErrors).to.be.false;
			const errors2 = getErrorProps('INVALID', [isTest], {});
			expect(errors2.hasErrors).to.be.true;
		});

		it('should work with custom parametrized validator through #create', () => {
			const is = Validators.createParametrized((isVal: string) =>
				Validators.create((value: string) => {
					if (value !== isVal) {
						return {
							name: 'is',
							got: value,
						};
					}
				})
			);

			const errors = getErrorProps('TEST', [is('TEST')], {});
			expect(errors.hasErrors).to.be.false;
			const errors2 = getErrorProps('INVALID', [is('TEST')], {});
			expect(errors2.hasErrors).to.be.true;
		});

		it('should work with dependable validators', () => {
			const isPasswordSame = Validators.create(
				(
					passwordRepeat: string,
					values: InternalState<{ password: string }>
				) => {
					if (passwordRepeat !== values.password.value) {
						return {
							name: 'isPasswordSame',
						};
					}
				}
			);

			const errors = getErrorProps('123', [isPasswordSame], {
				password: {
					value: 'abc',
					dirty: true,
					touched: true,
				},
			});
			expect(errors.hasErrors).to.be.true;
			const errors2 = getErrorProps('123', [isPasswordSame], {
				password: {
					value: '123',
					dirty: true,
					touched: true,
				},
			});
			expect(errors2.hasErrors).to.be.false;
		});

		it('should work with conditional validators', () => {
			const switchIs = (is: boolean) =>
				Validators.if(() => is, [Validators.required]);

			const errors = getErrorProps('', [switchIs(true)], {});
			expect(errors.hasErrors).to.be.true;
			const errors2 = getErrorProps('', [switchIs(false)], {});
			expect(errors2.hasErrors).to.be.false;
		});

		it('should get single error if one validator fails', () => {
			const errors = getErrorProps(
				'',
				[Validators.required, Validators.maxLength(3)],
				{}
			);
			const expectedError = {
				name: 'required',
				got: '',
			} as OutputErrorType;

			expect(errors.hasErrors).to.be.true;
			expect(errors.errors).to.deep.equal([expectedError]);
			expect(errors.errorsMap).to.deep.equal({
				required: expectedError,
			});
		});

		it('should get multiple errors if multiple validators fail', () => {
			const errors = getErrorProps(
				'',
				[Validators.required, Validators.minLength(3)],
				{}
			);
			const expectedErrorReq = {
				name: 'required',
				got: '',
			} as OutputErrorType;
			const expectedErrorMinLen = {
				name: 'minLength',
				got: '',
				length: 0,
				expectedLength: 3,
			} as OutputErrorType;

			expect(errors.hasErrors).to.be.true;
			expect(errors.errors).to.deep.equal([
				expectedErrorReq,
				expectedErrorMinLen,
			]);
			expect(errors.errorsMap).to.deep.equal({
				required: expectedErrorReq,
				minLength: expectedErrorMinLen,
			});
		});
	});

	describe('#extError', () => {
		it('should get error text when error appears', () => {
			const errors = getErrorProps('', [Validators.required], {});
			const errorMap: ErrorMappings = {
				required: () => 'req',
			};

			const errorText = extError(errorMap, errors.errors[0]);

			expect(errorText).to.equal('req');
		});

		it('should get empty text when no error appears', () => {
			const errors = getErrorProps('TEST', [Validators.required], {});
			const errorMap: ErrorMappings = {
				required: () => 'req',
			};

			const errorText = extError(errorMap, errors.errors[0]);

			expect(errorText).to.equal('');
		});

		it('should use default mapping if no mapping is specified', () => {
			const errors = getErrorProps('', [Validators.required], {});
			const errorMap: ErrorMappings = {
				default: () => 'default',
			};

			const errorText = extError(errorMap, errors.errors[0]);

			expect(errorText).to.equal('default');
		});

		it('should fail if no error mapping specified', () => {
			const errors = getErrorProps('', [Validators.required], {});
			const errorMap: ErrorMappings = {};

			let error: Error | null = null;
			try {
				extError(errorMap, errors.errors[0]);
			} catch (e) {
				error = e;
			}
			expect(error).to.not.be.undefined;
			expect(error?.message).to.contain('No error-mapping specified');
		});
	});
});
