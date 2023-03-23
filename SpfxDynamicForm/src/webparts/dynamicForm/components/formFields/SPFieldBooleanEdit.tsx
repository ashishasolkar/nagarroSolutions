import * as React from 'react';
import { ISPFormFieldProps } from './SPFormField';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
// import * as strings from 'FormFieldStrings';

const SPFieldBooleanEdit: React.FunctionComponent<ISPFormFieldProps> = (props) => {
    const { value } = props;
    let isChecked = value === '1' || value === 'true' || value === 'Yes';
    return <Toggle
        className='ard-booleanFormField'
        checked={isChecked}
        // onAriaLabel={strings.ToggleOnAriaLabel}
        // offAriaLabel={strings.ToggleOffAriaLabel}
        onText="Yes"//{strings.ToggleOnText}
        offText="No"//{strings.ToggleOffText}
        onChange={(event: React.MouseEvent<HTMLElement>, checked: boolean) => props.onEventTriggered(checked.toString())}
    />;
};

export default SPFieldBooleanEdit;
