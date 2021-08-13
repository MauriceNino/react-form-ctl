import { expect } from 'chai';
import rewire from 'rewire';
import {
	FormCtlHookInputType,
	FormCtlHookReturnType,
	InternalState,
} from '../src/form-ctl';
const formCtlModule = rewire('../dist/form-ctl');

type TestFormData = {
	name: string;
	age: number;
	isOldEnough: boolean;
};

describe('form-ctl', () => {
	type GetInternalState<T> = (
		input: FormCtlHookInputType<T>
	) => InternalState<T>;
	const getInternalState: GetInternalState<TestFormData> =
		formCtlModule.__get__('getInternalState');

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
		formCtlModule.__get__('getInternalStateFromFormData');

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
		formCtlModule.__get__('getGlobalFormData');

	describe('#getGlobalFormData', () => {
		it('should get FormData from Basic internal state', () => {
			const formData = getGlobalFormData({
				name: { value: 'Maurice', dirty: false },
				age: { value: 22, dirty: false },
				isOldEnough: { value: true, dirty: false },
			});

			expect(formData).to.contain.all.keys('name', 'age', 'isOldEnough');
			expect(formData.name).to.equal('Maurice');
			expect(formData.age).to.equal(22);
			expect(formData.isOldEnough).to.equal(true);
		});
	});

	type GetDetailedFormData<T> = (
		input: FormCtlHookInputType<T>,
		state: InternalState<T>,
		setState: (
			updateFunc: (value: InternalState<T>) => InternalState<T>
		) => void
	) => FormCtlHookReturnType<T>['data'];
	const getDetailedFormData: GetDetailedFormData<TestFormData> =
		formCtlModule.__get__('getDetailedFormData');

	describe('#getDetailedFormData', () => {
		it('should get output data from internal state and input', () => {
			const hookInput: FormCtlHookInputType<TestFormData> = {
				name: ['Maurice'],
				age: [22],
				isOldEnough: [true],
			};
			const internalState: InternalState<TestFormData> = {
				name: { value: 'Maurice', dirty: false },
				age: { value: 22, dirty: false },
				isOldEnough: { value: true, dirty: false },
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
});
