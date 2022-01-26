import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React, { useEffect, useState } from 'react';
import { useFormControl } from '../src/form-control';
import { ErrorMappings } from '../src/types/error-handling';
import { FormControlHookInputType } from '../src/types/state';
import { extError, Validators } from '../src/validators';

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
		const form = useFormControl<TestFormData>({
			name: ['Mauz'],
		});

		return (
			<>
				<input
					id='name-inp'
					type='text'
					value={form.controls.name.value}
					onChange={e => form.controls.name.setValue(e.target.value)}
				/>
				<div id='name-out'>{form.controls.name.value}</div>
				<div id='name-err'>{form.controls.name.error?.name}</div>
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
		formCtl: FormControlHookInputType<ValidatedTestFormData>;
		errorMap: ErrorMappings;
	}) => {
		const form = useFormControl<ValidatedTestFormData>(props.formCtl);

		return (
			<>
				<input
					id='name-inp'
					type='text'
					value={form.controls.name.value}
					onChange={e => form.controls.name.setValue(e.target.value)}
				/>
				<div id='name-out'>{form.controls.name.value}</div>
				<div id='name-valid'>{form.controls.name.valid + ''}</div>
				<div id='name-dirty'>{form.controls.name.dirty + ''}</div>
				<div id='name-err'>
					{form.controls.name.invalid &&
						extError(props.errorMap, form.controls.name.error)}
				</div>

				<input
					id='age-inp'
					type='number'
					value={form.controls.age.value || ''}
					onChange={e => form.controls.age.setValue(+e.target.value)}
				/>
				<div id='age-out'>{form.controls.age.value}</div>
				<div id='age-valid'>{form.controls.age.valid + ''}</div>
				<div id='age-dirty'>{form.controls.age.dirty + ''}</div>
				<div id='age-err'>
					{form.controls.age.invalid &&
						extError(props.errorMap, form.controls.age.error)}
				</div>

				<input
					id='isOldEnough-inp'
					type='checkbox'
					checked={form.controls.isOldEnough.value}
					onChange={e =>
						form.controls.isOldEnough.setValue(!form.controls.isOldEnough.value)
					}
				/>
				<div id='isOldEnough-out'>{form.controls.isOldEnough.value}</div>
				<div id='isOldEnough-valid'>{form.controls.isOldEnough.valid + ''}</div>
				<div id='isOldEnough-dirty'>{form.controls.isOldEnough.dirty + ''}</div>
				<div id='isOldEnough-err'>
					{form.controls.isOldEnough.invalid &&
						extError(props.errorMap, form.controls.isOldEnough.error)}
				</div>
			</>
		);
	};

	it('renders complex form', () => {
		const formCtl: FormControlHookInputType<ValidatedTestFormData> = {
			name: [''],
			age: [0],
			isOldEnough: [false],
		};
		const errorMap: ErrorMappings = {};
		const wrapper = shallow(
			<ValidatedTestApp formCtl={formCtl} errorMap={errorMap} />
		);
		expect(wrapper).to.not.be.null;
	});

	it('validates complex form + transition', () => {
		const formCtl: FormControlHookInputType<ValidatedTestFormData> = {
			name: ['', [Validators.required]],
			age: [0, [Validators.min(5)]],
			isOldEnough: [false],
		};
		const errorMap: ErrorMappings = {
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
		formCtl: FormControlHookInputType<{ name: string }>;
		errorMap: ErrorMappings;
	}) => {
		const {
			controls: controls,
			setValue,
			reset,
		} = useFormControl<{ name: string }>(props.formCtl);

		return (
			<>
				<input
					id='name-inp'
					type='text'
					value={controls.name.value}
					onChange={e => controls.name.setValue(e.target.value)}
					onBlur={() => controls.name.markTouched()}
				/>
				<div id='name-out'>{controls.name.value}</div>
				<div id='name-valid'>{controls.name.valid + ''}</div>
				<div id='name-dirty'>{controls.name.dirty + ''}</div>
				<div id='name-touched'>{controls.name.touched + ''}</div>
				<div id='name-err'>
					{controls.name.invalid &&
						controls.name.touchedOrDirty &&
						extError(props.errorMap, controls.name.error)}
				</div>

				<button
					id='mark-non-dirty'
					onClick={() => controls.name.markDirty(false)}
				></button>

				<button
					id='set-global-state'
					onClick={() =>
						setValue({
							name: 'GLOBAL',
						})
					}
				></button>

				<button id='reset-global-state' onClick={() => reset()}></button>
				<button
					id='reset-name'
					onClick={() => controls.name.resetValue('')}
				></button>
			</>
		);
	};

	it('validates state changes', () => {
		const formCtl: FormControlHookInputType<{ name: string }> = {
			name: ['', [Validators.required]],
		};
		const errorMap: ErrorMappings = {
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

		const resetNameButton = wrapper.find('#reset-name');
		resetNameButton.simulate('click', {});
		expect(wrapper.find('#name-out')).to.have.text('');
		expect(wrapper.find('#name-dirty')).to.have.text('false');
		expect(wrapper.find('#name-touched')).to.have.text('false');

		const globalStateButton = wrapper.find('#set-global-state');
		globalStateButton.simulate('click', {});

		expect(wrapper.find('#name-out')).to.have.text('GLOBAL');
		expect(wrapper.find('#name-valid')).to.have.text('true');
		expect(wrapper.find('#name-dirty')).to.have.text('true');
		expect(wrapper.find('#name-touched')).to.have.text('true');
		expect(wrapper.find('#name-err')).to.have.text('');

		const resetStateButton = wrapper.find('#reset-global-state');
		resetStateButton.simulate('click', {});

		expect(wrapper.find('#name-out')).to.have.text('');
		expect(wrapper.find('#name-valid')).to.have.text('false');
		expect(wrapper.find('#name-dirty')).to.have.text('false');
		expect(wrapper.find('#name-touched')).to.have.text('false');
		expect(wrapper.find('#name-err')).to.have.text('');
	});

	type ValidatedSingleInputHelperTestFormData = {
		name: string;
		agree: boolean;
		age: number;
	};
	const ValidatedSingleInputHelperTestApp = (props: {
		formCtl: FormControlHookInputType<ValidatedSingleInputHelperTestFormData>;
	}) => {
		const { controls } = useFormControl<ValidatedSingleInputHelperTestFormData>(
			props.formCtl
		);

		controls.name.valid;

		return (
			<>
				<input id='name-inp' type='text' {...controls.name.inputProps()} />
				<div id='name-out'>{controls.name.value}</div>
				<div id='name-touched'>{controls.name.touched + ''}</div>

				<input
					id='age-inp'
					type='number'
					{...controls.age.numberInputProps()}
				/>
				<div id='age-out'>{controls.age.value}</div>
				<div id='age-touched'>{controls.age.touched + ''}</div>

				<input id='agree-inp' type='text' {...controls.agree.checkboxProps()} />
				<div id='agree-out'>{controls.agree.value + ''}</div>
				<div id='agree-touched'>{controls.agree.touched + ''}</div>
			</>
		);
	};

	it('validate state changes using input helper', () => {
		const formCtl: FormControlHookInputType<ValidatedSingleInputHelperTestFormData> =
			{
				name: [''],
				agree: [false],
				age: [0],
			};
		const wrapper = shallow(
			<ValidatedSingleInputHelperTestApp formCtl={formCtl} />
		);
		const nameInp = wrapper.find('#name-inp');
		const agreeInp = wrapper.find('#agree-inp');
		const ageInp = wrapper.find('#age-inp');

		expect(wrapper.find('#name-out')).to.have.text('');
		expect(wrapper.find('#name-touched')).to.have.text('false');
		expect(wrapper.find('#agree-out')).to.have.text('false');
		expect(wrapper.find('#agree-touched')).to.have.text('false');
		expect(wrapper.find('#age-out')).to.have.text('0');
		expect(wrapper.find('#age-touched')).to.have.text('false');

		nameInp.simulate('focus', {});
		nameInp.simulate('blur', {});
		agreeInp.simulate('focus', {});
		agreeInp.simulate('blur', {});
		ageInp.simulate('focus', {});
		ageInp.simulate('blur', {});

		expect(wrapper.find('#name-touched')).to.have.text('true');
		expect(wrapper.find('#agree-touched')).to.have.text('true');
		expect(wrapper.find('#age-touched')).to.have.text('true');

		nameInp.simulate('change', { target: { value: 'Mauz' } });
		agreeInp.simulate('change', {});
		ageInp.simulate('change', { target: { value: '123' } });

		expect(wrapper.find('#name-out')).to.have.text('Mauz');
		expect(wrapper.find('#name-touched')).to.have.text('true');
		expect(wrapper.find('#agree-out')).to.have.text('true');
		expect(wrapper.find('#agree-touched')).to.have.text('true');
		expect(wrapper.find('#age-out')).to.have.text('123');
		expect(wrapper.find('#age-touched')).to.have.text('true');

		ageInp.simulate('change', { target: { value: '123abc' } });
		expect(wrapper.find('#age-out')).to.have.text('123');

		ageInp.simulate('change', { target: { value: '' } });
		expect(wrapper.find('#age-out')).to.have.text('');
	});

	const ChangingInputTestApp = () => {
		const [name, setName] = useState('');
		const { controls } = useFormControl<{ name: string }>({
			name: [name],
		});

		useEffect(() => {
			setName(controls.name.value);
		}, [controls]);

		return (
			<>
				<input
					id='name-inp'
					type='text'
					value={controls.name.value}
					onChange={e => controls.name.setValue(e.target.value)}
					onBlur={() => controls.name.markTouched()}
				/>
				<div id='name-out'>{controls.name.value}</div>
				<button
					id='manual-value-set'
					onClick={() => setName('Should not update')}
				></button>
			</>
		);
	};

	it('validate state changes using external state', () => {
		const wrapper = shallow(<ChangingInputTestApp />);
		const nameInp = wrapper.find('#name-inp');

		expect(wrapper.find('#name-out')).to.have.text('');

		const btn = wrapper.find('#manual-value-set');
		btn.simulate('click', {});

		expect(wrapper.find('#name-out')).to.have.text('');

		nameInp.simulate('change', { target: { value: 'Mauz' } });

		expect(wrapper.find('#name-out')).to.have.text('Mauz');
	});

	const ConditionalValidatorTestApp = () => {
		const [isSwitch, setIsSwitch] = useState(false);
		const { controls } = useFormControl<{ name: string }>(
			{
				name: ['', [Validators.if(() => isSwitch, [Validators.required])]],
			},
			[isSwitch]
		);

		return (
			<>
				<input
					id='name-inp'
					type='text'
					value={controls.name.value}
					onChange={e => controls.name.setValue(e.target.value)}
					onBlur={() => controls.name.markTouched()}
				/>
				<div id='name-out'>{controls.name.value}</div>
				<div id='name-sw'>{isSwitch ? 'true' : 'false'}</div>
				<div id='name-error'>{controls.name.error?.name ?? ''}</div>
				<button id='set-switch' onClick={() => setIsSwitch(true)}></button>
			</>
		);
	};

	it('validate state changes using conditional validators', () => {
		const wrapper = shallow(<ConditionalValidatorTestApp />);
		const nameInp = wrapper.find('#name-inp');

		expect(wrapper.find('#name-out')).to.have.text('');
		expect(wrapper.find('#name-sw')).to.have.text('false');
		expect(wrapper.find('#name-error')).to.have.text('');

		const btn = wrapper.find('#set-switch');
		btn.simulate('click', {});

		expect(wrapper.find('#name-out')).to.have.text('');
		expect(wrapper.find('#name-sw')).to.have.text('true');
		expect(wrapper.find('#name-error')).to.have.text('required');
	});
});
