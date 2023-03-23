import { DefaultButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { ISPFormFieldProps } from './SPFormField';

const SPFieldButton: React.FunctionComponent<ISPFormFieldProps> = (props) => {

    const { Disable, Title, Description, Type } = props.fieldSchema;

    return <DefaultButton
        text={Title}
        onClick={props.onEventTriggered}
        allowDisabledFocus
        disabled={Disable}
        title={Description}
        secondaryText={Description}
        primary={Type == 'primary'}
        iconProps={{ iconName: "Search" }}
    />;
    //   <PrimaryButton text="Primary" onClick={_alertClicked} allowDisabledFocus disabled={disabled} checked={checked} />
}

export default SPFieldButton;