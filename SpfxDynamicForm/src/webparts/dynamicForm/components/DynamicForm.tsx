import * as React from 'react';
// import styles from './DynamicForm.module.scss';
import { IDynamicFormProps } from './IDynamicFormProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { DynamicForm as PnpDynamicForm } from "@pnp/spfx-controls-react/lib/DynamicForm";
import { IDynamicFieldProps } from '@pnp/spfx-controls-react/lib/controls/dynamicForm/dynamicField';
import { TextField, Icon } from 'office-ui-fabric-react';
import styles from './DynamicForm.module.scss';
import AdvancedDynamicForm from './CustomFormFromScratch/AdvancedDynamicForm';
import { ControlMode } from '../../../common/datatypes/ControlMode';

export default class DynamicForm extends React.Component<IDynamicFormProps, {}> {
  public render(): React.ReactElement<IDynamicFormProps> {
    // const {
    //   description,
    //   isDarkTheme,
    //   environmentMessage,
    //   hasTeamsContext,
    //   userDisplayName
    // } = this.props;
    const fieldOverrides: {
      [columnInternalName: string]: (fieldProperties: IDynamicFieldProps) => React.ReactElement<IDynamicFieldProps>;
    } = {
      Title: this._renderFieldByType,
      NumberField: this._renderFieldByType
    };
    return (
      <>
        <AdvancedDynamicForm title={"Dynamic Form"} webUrl="" listUrl='' formType={ControlMode.Edit} context={this.props.context} />
        {/* <PnpDynamicForm
          context={this.props.context}
          listId={"bb17f871-993a-47ab-af26-94e31a2bf451"}
          listItemId={0}
          onCancelled={() => { console.log('Cancelled') }}
          onBeforeSubmit={async (listItem) => { return false; }}
          onSubmitError={(listItem, error) => { alert(error.message); }}
          onSubmitted={async (listItemData) => { console.log(listItemData); }}
          fieldOverrides={fieldOverrides}
        >

        </PnpDynamicForm> */}
      </>
    );

  }

  private _renderFieldByType = (fieldProperties: IDynamicFieldProps): React.ReactElement<IDynamicFieldProps> => {
    console.log("fieldProperties", fieldProperties);
    const { fieldType, fieldTitle, required, disabled, description, onChanged, columnInternalName, placeholder, value } = fieldProperties;
    switch (fieldType) {
      case "Text":
        return this._renderTextField(fieldProperties);
        break;
      case "Number":
        return this._renderNumericField(fieldProperties);
        break;
      default:
        return <div>Title: <TextField label={fieldTitle}
          required={required}
          disabled={disabled}
          description={description}
          onChange={(ev, newValue) => onChanged(columnInternalName, newValue)}
          placeholder={placeholder}
          value={value}
          errorMessage={"this is required field"}
        /></div>
        break;
    }

  }
  private _renderTextField = (fieldProperties: IDynamicFieldProps): React.ReactElement<IDynamicFieldProps> => {
    console.log("_renderTextField fieldProperties", fieldProperties);
    const { fieldTitle, required, disabled, description, onChanged, columnInternalName, placeholder, value } = fieldProperties;
    return <div>
      <Icon iconName="TextField" className={styles.fieldIcon} />
      <TextField label={fieldTitle}
        required={required} iconProps={{ iconName: "TextField" }}
        disabled={disabled}
        description={description}
        onChange={(ev, newValue) => onChanged(columnInternalName, newValue)}
        placeholder={placeholder}
        value={value}
        errorMessage={"This is required field"}
      /></div>
  }
  private _renderNumericField = (fieldProperties: IDynamicFieldProps): React.ReactElement<IDynamicFieldProps> => {
    console.log("_renderNumericField fieldProperties", fieldProperties);
    const { fieldTitle, required, disabled, description, onChanged, columnInternalName, placeholder, value } = fieldProperties;
    let customizeProps = JSON.parse(description);
    console.log(customizeProps);

    return <div>
      <Icon iconName="NumberField" className={styles.fieldIcon} />
      <TextField label={fieldTitle}
        required={required}
        iconProps={{ iconName: "NumberField" }}
        disabled={disabled}
        description={description}
        onChange={(ev, newValue) => {
          if (customizeProps.minVal && customizeProps.maxVal) {

          } else {
            onChanged(columnInternalName, newValue);
          }
        }}
        placeholder={placeholder}
        value={value}
        errorMessage={value == "" ? "This is required field" : ""}
      /></div>
  }
}
