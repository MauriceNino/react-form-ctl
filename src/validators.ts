export type CommonErrorTypes = 'required' | 'minLength' | 'maxLength';
export type ErrorType = { name: CommonErrorTypes | string; [prop: string]: any; }
export type ErrorsMapType = {
    [prop in CommonErrorTypes | string]: {
        [prop: string]: any;
    };
};

export type ValidatorType = (
	value: any,
) => ErrorType | null;

const requiredValidator: ValidatorType = (value: any) => {
	if (value === null || value === '' || value === true) {
		return {name: 'required'};
	}

	return null;
};

export const Validators = {
	required: requiredValidator,
	minLength: (length: number): ValidatorType => {
		return (value: string) => {
			if (value.length < length) {
				return {
					name: 'minLength',
                    length: value.length,
					expectedLength: length
				};
			}

			return null;
		};
	},
	maxLength: (length: number): ValidatorType => {
		return (value: string) => {
			if (value.length > length) {
				return {
					name: 'maxLength',
                    length: value.length,
					expectedLength: length
				};
			}

			return null;
		};
	},
};

export type ErrorMappingsType = {
    [key in CommonErrorTypes | string]: (error: ErrorType) => void;
};

export const extError = (map: ErrorMappingsType, error: ErrorType) => {
    if(!error) {
        return '';
    }

    const mappedError = map[error.name];
    return mappedError(error);
}
