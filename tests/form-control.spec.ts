import { expect } from 'chai';
import rewire from 'rewire';
import {
	FormControlHookInputType,
	FormCtlHookReturnType,
	InternalState,
} from '../src/types/state';
const formControlModule = rewire('../dist/form-control');

type TestFormData = {
	name: string;
	age: number;
	isOldEnough: boolean;
};

describe('form-control', () => {
	type GetInternalState<T> = (
		input: FormControlHookInputType<T>
	) => InternalState<T>;
	const getInternalState: GetInternalState<TestFormData> =
		formControlModule.__get__('getInternalState');

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

	type GetInternalStateFromFormData<T> = (input: T) => InternalState<T>;
	const getInternalStateFromFormData: GetInternalStateFromFormData<TestFormData> =
		formControlModule.__get__('getInternalStateFromFormData');

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

	type GetGlobalFormData<T> = (input: InternalState<T>) => T;
	const getGlobalFormData: GetGlobalFormData<TestFormData> =
		formControlModule.__get__('getGlobalFormData');

	describe('#getGlobalFormData', () => {
		it('should get FormData from Basic internal state', () => {
			const formData = getGlobalFormData({
				name: { value: 'Maurice', dirty: false, touched: false },
				age: { value: 22, dirty: false, touched: false },
				isOldEnough: { value: true, dirty: false, touched: false },
			});

			expect(formData).to.contain.all.keys('name', 'age', 'isOldEnough');
			expect(formData.name).to.equal('Maurice');
			expect(formData.age).to.equal(22);
			expect(formData.isOldEnough).to.equal(true);
		});
	});

	type GetDetailedFormData<T> = (
		input: FormControlHookInputType<T>,
		state: InternalState<T>,
		setState: (
			updateFunc: (value: InternalState<T>) => InternalState<T>
		) => void
	) => FormCtlHookReturnType<T>['controls'];
	const getDetailedFormData: GetDetailedFormData<TestFormData> =
		formControlModule.__get__('getDetailedFormData');

	describe('#getDetailedFormData', () => {
		it('should get output data from internal state and input', () => {
			const hookInput: FormControlHookInputType<TestFormData> = {
				name: ['Maurice'],
				age: [22],
				isOldEnough: [true],
			};
			const internalState: InternalState<TestFormData> = {
				name: { value: 'Maurice', dirty: false, touched: false },
				age: { value: 22, dirty: false, touched: false },
				isOldEnough: { value: true, dirty: false, touched: false },
			};

			const detailedFormData = getDetailedFormData(
				hookInput,
				internalState,
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
				name: { value: 'Maurice', dirty: false, touched: false },
				age: { value: 22, dirty: false, touched: false },
				isOldEnough: { value: true, dirty: false, touched: false },
			};

			const detailedFormData = getDetailedFormData(
				hookInput,
				internalState,
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
