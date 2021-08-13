import React from 'react';
import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import Enzyme, { mount, render, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { FormCtlHookInputType, useFormCtl } from '../src/form-ctl';
import { ErrorMappingsType, extError, Validators } from '../src/validators';

Enzyme.configure({ adapter: new Adapter() });
chai.use(chaiEnzyme());
const { expect } = chai;

describe('usage-tests', () => {
	const EmptyComponent = () => {
		return <div></div>;
	};

	it('renders single div', () => {
		const wrapper = shallow(<EmptyComponent />);
		expect(wrapper).to.not.be.null;
	});

	const SimpleTestApp = () => {
		type TestFormData = {
			name: string;
		};
		const form = useFormCtl<TestFormData>({
			name: ['Mauz'],
		});

		return (
			<>
				<input
					id='name-inp'
					type='text'
					value={form.data.name.value}
					onChange={e => form.data.name.setValue(e.target.value)}
				/>
				<div id='name-out'>{form.data.name.value}</div>
				<div id='name-err'>{form.data.name.error?.name}</div>
			</>
		);
	};

	it('renders simple form', () => {
		const wrapper = shallow(<SimpleTestApp />);
		const nameOut = wrapper.find('#name-out');
		const nameErr = wrapper.find('#name-err');

		expect(nameOut).to.have.text('Mauz');
		expect(nameErr).to.have.text('');
	});

	type ValidatedTestFormData = {
		name: string;
		age: number;
		isOldEnough: boolean;
	};
	const ValidatedTestApp = (props: {
		formCtl: FormCtlHookInputType<ValidatedTestFormData>;
		errorMap: ErrorMappingsType;
	}) => {
		const form = useFormCtl<ValidatedTestFormData>(props.formCtl);

		return (
			<>
				<input
					id='name-inp'
					type='text'
					value={form.data.name.value}
					onChange={e => form.data.name.setValue(e.target.value)}
				/>
				<div id='name-out'>{form.data.name.value}</div>
				<div id='name-valid'>{form.data.name.valid + ''}</div>
				<div id='name-dirty'>{form.data.name.dirty + ''}</div>
				<div id='name-err'>
					{form.data.name.invalid &&
						extError(props.errorMap, form.data.name.error)}
				</div>

				<input
					id='age-inp'
					type='number'
					value={form.data.age.value}
					onChange={e => form.data.age.setValue(e.target.value as any)}
				/>
				<div id='age-out'>{form.data.age.value}</div>
				<div id='age-valid'>{form.data.age.valid + ''}</div>
				<div id='age-dirty'>{form.data.age.dirty + ''}</div>
				<div id='age-err'>
					{form.data.age.invalid &&
						extError(props.errorMap, form.data.age.error)}
				</div>

				<input
					id='isOldEnough-inp'
					type='checkbox'
					checked={form.data.isOldEnough.value}
					onChange={e =>
						form.data.isOldEnough.setValue(!form.data.isOldEnough.value)
					}
				/>
				<div id='isOldEnough-out'>{form.data.isOldEnough.value}</div>
				<div id='isOldEnough-valid'>{form.data.isOldEnough.valid + ''}</div>
				<div id='isOldEnough-dirty'>{form.data.isOldEnough.dirty + ''}</div>
				<div id='isOldEnough-err'>
					{form.data.isOldEnough.invalid &&
						extError(props.errorMap, form.data.isOldEnough.error)}
				</div>
			</>
		);
	};

	it('renders complex form', () => {
		const formCtl: FormCtlHookInputType<ValidatedTestFormData> = {
			name: [''],
			age: [0],
			isOldEnough: [false],
		};
		const errorMap: ErrorMappingsType = {};
		const wrapper = shallow(
			<ValidatedTestApp formCtl={formCtl} errorMap={errorMap} />
		);
		expect(wrapper).to.not.be.null;
	});

	it('validates complex form + transition', () => {
		const formCtl: FormCtlHookInputType<ValidatedTestFormData> = {
			name: ['', [Validators.required]],
			age: [0, [Validators.min(5)]],
			isOldEnough: [false],
		};
		const errorMap: ErrorMappingsType = {
			required: () => 'required',
			min: ({ got, expected }) => `min ${got} < ${expected}`,
		};
		const wrapper = shallow(
			<ValidatedTestApp formCtl={formCtl} errorMap={errorMap} />
		);
		const nameInp = wrapper.find('#name-inp');
		const ageInp = wrapper.find('#age-inp');

		expect(wrapper.find('#name-out')).to.have.text('');
		expect(wrapper.find('#name-valid')).to.have.text('false');
		expect(wrapper.find('#name-dirty')).to.have.text('false');
		expect(wrapper.find('#name-err')).to.have.text('required');
		expect(wrapper.find('#age-out')).to.have.text('0');
		expect(wrapper.find('#age-valid')).to.have.text('false');
		expect(wrapper.find('#age-dirty')).to.have.text('false');
		expect(wrapper.find('#age-err')).to.have.text('min 0 < 5');

		nameInp.simulate('change', { target: { value: 'Mauz' } });
		ageInp.simulate('change', { target: { value: 4 } });

		expect(wrapper.find('#name-out')).to.have.text('Mauz');
		expect(wrapper.find('#name-valid')).to.have.text('true');
		expect(wrapper.find('#name-dirty')).to.have.text('true');
		expect(wrapper.find('#name-err')).to.have.text('');
		expect(wrapper.find('#age-out')).to.have.text('4');
		expect(wrapper.find('#age-valid')).to.have.text('false');
		expect(wrapper.find('#age-dirty')).to.have.text('true');
		expect(wrapper.find('#age-err')).to.have.text('min 4 < 5');

		ageInp.simulate('change', { target: { value: 22 } });

		expect(wrapper.find('#name-out')).to.have.text('Mauz');
		expect(wrapper.find('#name-valid')).to.have.text('true');
		expect(wrapper.find('#name-dirty')).to.have.text('true');
		expect(wrapper.find('#name-err')).to.have.text('');
		expect(wrapper.find('#age-out')).to.have.text('22');
		expect(wrapper.find('#age-valid')).to.have.text('true');
		expect(wrapper.find('#age-dirty')).to.have.text('true');
		expect(wrapper.find('#age-err')).to.have.text('');
	});

	const ValidatedSingleInputTestApp = (props: {
		formCtl: FormCtlHookInputType<{ name: string }>;
		errorMap: ErrorMappingsType;
	}) => {
		const { data, setValue } = useFormCtl<{ name: string }>(props.formCtl);

		return (
			<>
				<input
					id='name-inp'
					type='text'
					value={data.name.value}
					onChange={e => data.name.setValue(e.target.value)}
					onBlur={() => data.name.markTouched()}
				/>
				<div id='name-out'>{data.name.value}</div>
				<div id='name-valid'>{data.name.valid + ''}</div>
				<div id='name-dirty'>{data.name.dirty + ''}</div>
				<div id='name-touched'>{data.name.touched + ''}</div>
				<div id='name-err'>
					{data.name.invalid &&
						data.name.tod &&
						extError(props.errorMap, data.name.error)}
				</div>

				<button
					id='mark-non-dirty'
					onClick={() => data.name.markDirty(false)}
				></button>

				<button
					id='set-global-state'
					onClick={() =>
						setValue({
							name: 'GLOBAL',
						})
					}
				></button>
			</>
		);
	};

	it('validates state changes', () => {
		const formCtl: FormCtlHookInputType<{ name: string }> = {
			name: ['', [Validators.required]],
		};
		const errorMap: ErrorMappingsType = {
			required: () => 'required',
			min: ({ got, expected }) => `min ${got} < ${expected}`,
		};
		const wrapper = shallow(
			<ValidatedSingleInputTestApp formCtl={formCtl} errorMap={errorMap} />
		);
		const nameInp = wrapper.find('#name-inp');

		expect(wrapper.find('#name-out')).to.have.text('');
		expect(wrapper.find('#name-valid')).to.have.text('false');
		expect(wrapper.find('#name-dirty')).to.have.text('false');
		expect(wrapper.find('#name-touched')).to.have.text('false');
		expect(wrapper.find('#name-err')).to.have.text('');

		nameInp.simulate('focus', {});
		nameInp.simulate('blur', {});

		expect(wrapper.find('#name-out')).to.have.text('');
		expect(wrapper.find('#name-valid')).to.have.text('false');
		expect(wrapper.find('#name-dirty')).to.have.text('false');
		expect(wrapper.find('#name-touched')).to.have.text('true');
		expect(wrapper.find('#name-err')).to.have.text('required');

		nameInp.simulate('change', { target: { value: 'Mauz' } });

		expect(wrapper.find('#name-out')).to.have.text('Mauz');
		expect(wrapper.find('#name-valid')).to.have.text('true');
		expect(wrapper.find('#name-dirty')).to.have.text('true');
		expect(wrapper.find('#name-touched')).to.have.text('true');
		expect(wrapper.find('#name-err')).to.have.text('');

		const dirtyButton = wrapper.find('#mark-non-dirty');
		dirtyButton.simulate('click', {});

		expect(wrapper.find('#name-out')).to.have.text('Mauz');
		expect(wrapper.find('#name-valid')).to.have.text('true');
		expect(wrapper.find('#name-dirty')).to.have.text('false');
		expect(wrapper.find('#name-touched')).to.have.text('true');
		expect(wrapper.find('#name-err')).to.have.text('');

		const globalStateButton = wrapper.find('#set-global-state');
		globalStateButton.simulate('click', {});

		expect(wrapper.find('#name-out')).to.have.text('GLOBAL');
		expect(wrapper.find('#name-valid')).to.have.text('true');
		expect(wrapper.find('#name-dirty')).to.have.text('true');
		expect(wrapper.find('#name-touched')).to.have.text('true');
		expect(wrapper.find('#name-err')).to.have.text('');
	});

	type ValidatedSingleInputHelperTestFormData = {
		name: string;
		agree: boolean;
	};
	const ValidatedSingleInputHelperTestApp = (props: {
		formCtl: FormCtlHookInputType<ValidatedSingleInputHelperTestFormData>;
	}) => {
		const { data } = useFormCtl<ValidatedSingleInputHelperTestFormData>(
			props.formCtl
		);

		return (
			<>
				<input id='name-inp' type='text' {...data.name.inputProps} />
				<div id='name-out'>{data.name.value}</div>
				<div id='name-touched'>{data.name.touched + ''}</div>

				<input id='agree-inp' type='text' {...data.agree.checkboxProps} />
				<div id='agree-out'>{data.agree.value + ''}</div>
				<div id='agree-touched'>{data.agree.touched + ''}</div>
			</>
		);
	};

	it('validate state changes using input helper', () => {
		const formCtl: FormCtlHookInputType<ValidatedSingleInputHelperTestFormData> =
			{
				name: [''],
				agree: [false],
			};
		const wrapper = shallow(
			<ValidatedSingleInputHelperTestApp formCtl={formCtl} />
		);
		const nameInp = wrapper.find('#name-inp');
		const agreeInp = wrapper.find('#agree-inp');

		expect(wrapper.find('#name-out')).to.have.text('');
		expect(wrapper.find('#name-touched')).to.have.text('false');
		expect(wrapper.find('#agree-out')).to.have.text('false');
		expect(wrapper.find('#agree-touched')).to.have.text('false');

		nameInp.simulate('focus', {});
		nameInp.simulate('blur', {});
		agreeInp.simulate('focus', {});
		agreeInp.simulate('blur', {});

		expect(wrapper.find('#name-touched')).to.have.text('true');
		expect(wrapper.find('#agree-touched')).to.have.text('true');

		nameInp.simulate('change', { target: { value: 'Mauz' } });
		agreeInp.simulate('change', {});

		expect(wrapper.find('#name-out')).to.have.text('Mauz');
		expect(wrapper.find('#name-touched')).to.have.text('true');
		expect(wrapper.find('#agree-out')).to.have.text('true');
		expect(wrapper.find('#agree-touched')).to.have.text('true');
	});
});
