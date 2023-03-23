import * as React from 'react';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { Helper } from '../../../../common/Helper';
// import * as strings from 'FormFieldStrings';

export interface INumberFormFieldProps extends ITextFieldProps {
  label?: string;
  locale?: string;
  value: string;
  valueChanged(newValue?: string): void;
}

export default class NumberFormField extends React.Component<INumberFormFieldProps, null> {
  constructor(props: INumberFormFieldProps | Readonly<INumberFormFieldProps>) {
    super(props);

    this._validateNumber = this._validateNumber.bind(this);

  }

  public render(): JSX.Element {
    // We need to set value to empty string when null or undefined to force TextField
    // not to be used like an uncontrolled component and keep current value
    const value = this.props.value ? this.props.value : '';
    return (
      <TextField
        {...this.props}
        className='NumberFormField'
        label={this.props.label}
        value={value}
        onChange={(event, newValue) => this.props.valueChanged(newValue)}
        onGetErrorMessage={this._validateNumber}
      />
    );
  }

  private _validateNumber(value: string): string {
    // return isNaN(this.parseNumber(value, this.props.locale))
    //   ? `${value} is not a valid number.`//`${strings.InvalidNumberValue} ${value}`
    //   : '';
    return Helper.IsNotNumber(value)
      ? `${value} is not a valid number.`//`${strings.InvalidNumberValue} ${value}`
      : '';
  }

  // private parseNumber(value: string, locale = navigator.language) {
  //   const decimalSperator = Intl.NumberFormat(locale).format(1.1).charAt(1);
  //   // const cleanPattern = new RegExp(`[^-+0-9${ example.charAt( 1 ) }]`, 'g');
  //   const cleanPattern = new RegExp(`[${'\' ,.'.replace(decimalSperator, '')}]`, 'g');
  //   const cleaned = value.replace(cleanPattern, '');
  //   const normalized = cleaned.replace(decimalSperator, '.');
  //   return Number(normalized);
  // }

}
