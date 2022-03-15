import { expect } from 'chai';
import {
	getDetailedFormData,
	getGlobalFormData,
	getInternalState,
	getInternalStateFromFormData,
} from '../src/form-control-state';
import { FormControlHookInputType, InternalState } from '../src/types/state';

type TestFormData = {
	name: string;
	age: number;
	isOldEnough: boolean;
};

describe('form-control', () => {
	describe('#getInternalState', () => {
		it('should get Basic internal state', () => {
			const internalState = getInternalState({
				name: ['Maurice'],
				age: [22],
				isOldEnough: [true],
			});

			expect(internalState).to.contain.all.keys('name', 'age', 'isOldEnough');
			expect(internalState.name).to.contain.all.keys('value', 'dirty');
			expect(internalState.name.value).to.equal('Maurice');
			expect(internalState.age.value).to.equal(22);
			expect(internalState.isOldEnough.value).to.equal(true);
		});
	});

	describe('#getInternalStateFromFormData', () => {
		it('should get Basic internal state', () => {
			const internalState = getInternalStateFromFormData({
				name: 'Maurice',
				age: 22,
				isOldEnough: true,
			});

			expect(internalState).to.contain.all.keys('name', 'age', 'isOldEnough');
			expect(internalState.name).to.contain.all.keys('value', 'dirty');
			expect(internalState.name.value).to.equal('Maurice');
			expect(internalState.age.value).to.equal(22);
			expect(internalState.isOldEnough.value).to.equal(true);
		});
	});

	describe('#getGlobalFormData', () => {
		it('should get FormData from Basic internal state', () => {
			const formData = getGlobalFormData({
				name: {
					value: 'Maurice',
					dirty: false,
					touched: false,
				},
				age: { value: 22, dirty: false, touched: false },
				isOldEnough: {
					value: true,
					dirty: false,
					touched: false,
				},
			});

			expect(formData).to.contain.all.keys('name', 'age', 'isOldEnough');
			expect(formData.name).to.equal('Maurice');
			expect(formData.age).to.equal(22);
			expect(formData.isOldEnough).to.equal(true);
		});
	});

	describe('#getDetailedFormData', () => {
		it('should get output data from internal state and input', () => {
			const hookInput: FormControlHookInputType<TestFormData> = {
				name: ['Maurice'],
				age: [22],
				isOldEnough: [true],
			};
			const internalState: InternalState<TestFormData> = {
				name: {
					value: 'Maurice',
					dirty: false,
					touched: false,
				},
				age: { value: 22, dirty: false, touched: false },
				isOldEnough: {
					value: true,
					dirty: false,
					touched: false,
				},
			};

			const detailedFormData = getDetailedFormData(
				hookInput,
				undefined,
				internalState,
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				() => {}
			);

			expect(detailedFormData).to.contain.all.keys(
				'name',
				'age',
				'isOldEnough'
			);
			expect(detailedFormData.name).to.contain.all.keys(
				'value',
				'dirty',
				'valid',
				'invalid',
				'setValue',
				'error',
				'errors'
			);
			expect(detailedFormData.name.value).to.equal('Maurice');
			expect(detailedFormData.name.valid).to.equal(true);
			expect(detailedFormData.name.invalid).to.equal(false);
			expect(detailedFormData.name.error).to.be.undefined;
			expect(detailedFormData.name.errors).to.be.undefined;
		});
	});

	describe('RN input props', () => {
		it('for coverage', () => {
			const hookInput: FormControlHookInputType<TestFormData> = {
				name: ['Maurice'],
				age: [22],
				isOldEnough: [true],
			};
			const internalState: InternalState<TestFormData> = {
				name: {
					value: 'Maurice',
					dirty: false,
					touched: false,
				},
				age: { value: 22, dirty: false, touched: false },
				isOldEnough: {
					value: true,
					dirty: false,
					touched: false,
				},
			};

			const detailedFormData = getDetailedFormData(
				hookInput,
				undefined,
				internalState,
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				() => {}
			);

			expect(detailedFormData.name.rnInputProps).to.not.be.undefined;
			expect(detailedFormData.age.rnNumberInputProps).to.not.be.undefined;
			expect(detailedFormData.name.rnInputProps().value).to.be.equal('Maurice');
			expect(detailedFormData.age.rnNumberInputProps().value).to.be.equal('22');
			detailedFormData.name.rnInputProps().onBlur();
			detailedFormData.name.rnInputProps().onChangeText('Test');
			detailedFormData.age.rnNumberInputProps().onBlur();
			detailedFormData.age.rnNumberInputProps().onChangeText('23');
		});
	});
});
