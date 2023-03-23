import { SPFI } from "@pnp/sp";
import * as React from "react";
import { FormEvent, useEffect, useState } from "react";
import { getSP } from "../../pnpjs-config";
import "@pnp/sp/fields/list";
import "@pnp/sp/views";
import { Dropdown, IDropdownOption, IDropdownProps, MessageBar, MessageBarType } from "office-ui-fabric-react";
import { IFieldInfo } from "@pnp/sp/fields/types";
import SPFormField from "../formFields/SPFormField";
import { ControlMode } from "../../../../common/datatypes/ControlMode";
import { IListFormProps } from "../IListFormProps";
import { IListFormState } from "../IListFormState";
import { IFieldSchema } from "../../../../common/services/datatypes/RenderListData";
import { Helper } from "../../../../common/Helper";

export default function AdvancedDynamicForm(props: IListFormProps) {
    let _sp: SPFI = getSP();
    const formListName: string = "GenList";
    const [listViews, setListViews] = useState([]);
    let _fieldsInfo: IFieldInfo[] = [];
    // const [formFields, setFormFields] = useState(_fieldsInfo);
    const _state: IListFormState = {
        isLoadingSchema: false,
        isLoadingData: false,
        isSaving: false,
        data: {},//field values stored here
        originalData: {},
        errors: [],
        notifications: [],
        fieldErrors: {},
        hasError: false,
        errorInfo: '',
        // formFields: []
    };
    const [state, setState] = useState(_state);

    //SAMPLE - FORM CONFIGURATION
    // let temp = {
    //     formTitle: "Dynamic Form Rendering",
    //     listName: "GenList",
    //     listViewName: "Cascading Dropdowns",
    //     fields:
    //     {
    //         "Cascade_ChoiceColumn2": {
    //             fieldInternalName: "Cascade_ChoiceColumn2",
    //             dependentField: "Cascade_ChoiceColumn1",
    //             commandType: "",
    //             commandText: "view",
    //         },
    //         "Cascade_ChoiceColumn3": {
    //             fieldInternalName: "Cascade_ChoiceColumn3",
    //             dependentField: "Cascade_ChoiceColumn2",
    //             commandType: "",
    //             commandText: "view",
    //         }
    //     },
    //     buttons: [
    //         {
    //             buttonTitle: "Search",
    //             tooltip: "This is tooltip",
    //             disabled: false,
    //             type: "default",
    //             actions: ["validate", "submitToApi"],
    //             validationDetails: {
    //             },
    //             apiDetails: {
    //                 apiUrl: '',
    //                 inputParameters: [
    //                     {
    //                         parameterName: "choiceCol",
    //                         parameterValue: "Cascade_ChoiceColumn1"
    //                     }
    //                 ],
    //                 outputParameters: []
    //             },
    //             style: {
    //                 iconName: 'Search'
    //             }
    //         }
    //     ]
    // };
    const formConfigurationJSON: string = '{"formTitle":"Dynamic Form Rendering","listName":"GenList","listViewName":"Cascading Dropdowns","fields":{"Cascade_ChoiceColumn2":{"fieldInternalName":"Cascade_ChoiceColumn2","dependentField":"Cascade_ChoiceColumn1","commandType":"","commandText":"view"},"Cascade_ChoiceColumn3":{"fieldInternalName":"Cascade_ChoiceColumn3","dependentField":"Cascade_ChoiceColumn2","commandType":"","commandText":"view"}},"buttons":[{"buttonTitle":"Search","tooltip":"This is tooltip","disabled":false,"type":"default","actions":["validate","submitToApi"],"validationDetails":{},"apiDetails":{"apiUrl":"","inputParameters":[{"parameterName":"choiceCol","parameterValue":"Cascade_ChoiceColumn1"}],"outputParameters":[]},"style":{"iconName":"Search"}}]}';
    const formConfiguration = JSON.parse(formConfigurationJSON);

    useEffect(() => {
        const list = _sp.web.lists.getByTitle(formListName);

        (async () => {
            const views = await list.views();
            // console.log("view", views);
            setListViews(views.map(x => x.Title));
        })();
        console.log("_formConfig", formConfiguration);

    }, []);

    async function handleViewChange(event: FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): Promise<void> {
        // console.log("selected option", option);
        const list = _sp.web.lists.getByTitle(formListName);
        const fields = await list.fields();
        const viewFields = await list.views.getByTitle(option.key.toString()).fields();
        // console.log("fields ", fields.filter(x => x.Hidden == false), viewFields);
        let fieldsDetails = fields.filter(x => viewFields.Items.indexOf(x.InternalName) > -1);
        // console.log("fieldsDetails", fieldsDetails);
        let _fieldSchema: IFieldSchema[] = fieldsDetails.map(x => { return getFieldSchemaObject(x) });
        let _buttonsSchema: IFieldSchema[] = formConfiguration.buttons.map((x: any) => { return getFieldSchemaObjectForButton(x) });
        // console.log("_buttonsSchema", _buttonsSchema);
        let _tempFieldSchema = [..._fieldSchema, ..._buttonsSchema];
        let _data: any = {};
        _tempFieldSchema.filter(x => Helper.IsEmptyOrNull(x.DefaultValue) == false)
            .map(x => {
                if (x.DefaultValue == "[today]") {
                    // const date = new Date();
                    // const formattedDate = `${("0" + (date.getMonth() + 1)).slice(-2)}/${("0" + date.getDate()).slice(-2)}/${date.getFullYear()}`;

                    // _data[x.InternalName] = formattedDate;//3/17/2023

                } else
                    _data[x.InternalName] = x.DefaultValue;
            });

        setState({ ...state, fieldsSchema: _tempFieldSchema, data: _data });
    }

    return (
        <>
            <div>
                <Dropdown
                    placeholder="Select a view"
                    label="Render form by view"
                    options={listViews.map(x => { return { key: x, text: x }; })}
                    styles={{ dropdown: { width: 300 } }}
                    onChange={handleViewChange}
                />
            </div>
            <div>
                {renderFields()}

            </div>
        </>
    );

    // function renderFields() {
    //     const { fieldsSchema, data, fieldErrors, formFields } = state;
    //     const fields = [...formFields];

    //     return (fields && (fields.length > 0))
    //         ?
    //         <div className='ard-formFieldsContainer' >
    //             {
    //                 fields.map((field, idx) => {
    //                     const fieldSchema = getFieldSchemaObject(field);
    //                     const value: String = data[field.InternalName];
    //                     const errorMessage = "";
    //                     const fieldComponent = SPFormField({
    //                         fieldSchema: fieldSchema,
    //                         controlMode: props.formType,
    //                         value: value,
    //                         extraData: {},
    //                         errorMessage: errorMessage,
    //                         hideIfFieldUnsupported: true,// !this.props.showUnsupportedFields,
    //                         valueChanged: (val) => valueChanged(field.InternalName, val),
    //                         context: props.context,
    //                     });

    //                     return fieldComponent;

    //                 })
    //             }
    //         </div>
    //         : <MessageBar messageBarType={MessageBarType.warning}>No fields available!</MessageBar>;
    // }
    function renderFields() {
        const { fieldsSchema, data, fieldErrors } = state;

        return (fieldsSchema && (fieldsSchema.length > 0))
            ?
            <div className='ard-formFieldsContainer' >
                {
                    fieldsSchema.map((fieldSchema, idx) => {
                        const value: String = data[fieldSchema.InternalName];// == undefined ? fieldSchema.DefaultValue : data[fieldSchema.InternalName];
                        const errorMessage = fieldSchema.ErrorMessage;
                        const fieldComponent: any = SPFormField({
                            fieldSchema: fieldSchema,
                            controlMode: props.formType,
                            value: value,
                            extraData: {},
                            errorMessage: errorMessage,
                            hideIfFieldUnsupported: true,// !this.props.showUnsupportedFields,
                            // valueChanged: (val) => valueChanged(fieldSchema.InternalName, val),
                            onEventTriggered: (val) => handleEvent(fieldSchema, val),
                            // onButtonClick: () => handleButtonClick(fieldSchema),
                            context: props.context,
                        });

                        return fieldComponent;

                    })
                }
            </div>
            : <MessageBar messageBarType={MessageBarType.warning}>No fields available!</MessageBar>;
    }

    function handleEvent(_fieldSchema: IFieldSchema, newValue: any) {
        let type = _fieldSchema.FieldType;
        switch (type) {
            case "Button":
                handleButtonClick(_fieldSchema);
                break;
            default:
                handleFieldEvent(_fieldSchema, newValue);
                break;
        }
    }
    function handleButtonClick(buttonSchema: IFieldSchema) {
        // console.log("button clicked ", buttonSchema);
        let actions = buttonSchema.Actions;
        let isValid: boolean = true;

        for (let index = 0; index < actions.length; index++) {
            const action = actions[index];
            if (action == "validate") {
                isValid = action_Validate(buttonSchema);
                if (!isValid) break;
            }

            if (action == "submitToApi") {
                const { data } = state;
                let apiDetails = buttonSchema.ApiDetails;
                let inputParameters = apiDetails.inputParameters;
                let inputObject: any = {};
                inputParameters.forEach(parameter => {
                    inputObject[parameter.parameterName] = data[parameter.parameterValue];
                });
                console.log('api call inputObject', inputObject);
            }
        }

    }
    function action_Validate(fieldSchema: IFieldSchema): boolean {
        let isValid: boolean = true;
        const requiredFieldMessage: string = "This is required field.";
        const numberFieldMessage: string = "Please enter valid number.";
        const { data } = state;
        let fields = [...state.fieldsSchema];
        fields.map(field => {
            let isRequired: boolean = field.Required ? true : false;
            let type = field.Type;
            let value = data[field.InternalName];
            let errorMessage: string = "";
            if (isRequired && Helper.IsEmptyOrNull(value)) {
                isValid = false;
                errorMessage = requiredFieldMessage;
            } else if (type == 'Number' && Helper.IsNotNumber(value)) {
                isValid = false;
                errorMessage = numberFieldMessage;
            }
            field.ErrorMessage = errorMessage;
        });
        setState({ ...state, fieldsSchema: fields });
        return isValid;
    }





    function handleFieldEvent(_fieldSchema: IFieldSchema, newValue: any) {
        let fieldName = _fieldSchema.InternalName;
        if (_fieldSchema.FieldType == "User" || _fieldSchema.FieldType === "UserMulti") {
            //   for (let i = 0; i < newValue.length; i++) {
            //     // Security Group and Office 365 group need special handling
            //     if (newValue[i].Key.indexOf("c:0") === 0) {
            //       let newVal = await spPeopleService.resolvePeople(props.context, newValue[i].Key, props.webUrl);
            //       if (newVal.EntityData != null && newVal.EntityData.Email != null) {
            //         newValue[i].Key = newVal.EntityData.Email;
            //       }
            //       else {
            //         newValue[i].Key = newVal.Description;
            //       }
            //     }
            //   }
            //   this.setState((prevState, props) => {
            //     return {
            //       ...prevState,
            //       data: { ...prevState.data, [fieldName]: newValue },
            //       fieldErrors: {
            //         ...prevState.fieldErrors,
            //         [fieldName]:
            //           (prevState.fieldsSchema.filter((item) => item.InternalName === fieldName)[0].Required) && !newValue
            //             ? strings.RequiredValueMessage
            //             : ''
            //       }
            //     };
            //   },
            //   );
        }
        else {
            let _tempState = { ...state };
            _tempState.data = { ..._tempState.data, [fieldName]: newValue };
            _tempState.fieldsSchema = updateDependentFields(fieldName, newValue);
            setState({ ..._tempState });
        }
    }

    function getFieldSchemaObject(field: IFieldInfo | any): IFieldSchema {
        let _field = formConfiguration.fields[field.InternalName];
        let hasDependencyOnOtherField: boolean = !Helper.IsEmptyOrNull(_field ? _field["dependentField"] : '');

        let _fs: IFieldSchema = {
            Id: field.Id,
            Title: field.Title,
            InternalName: field.InternalName,
            Name: field.InternalName,
            Required: field.Required,
            FieldType: field.TypeAsString,
            Description: field.Description,
            Type: field.TypeAsString,
            DefaultValue: field.DefaultValue,
            AllowMultipleValues: field.AllowMultipleValues,
            ChoiceCount: (!hasDependencyOnOtherField && (field.Choices != null && field.Choices != undefined)) ? field.Choices.length : 0,
            Choices: !hasDependencyOnOtherField ? field.Choices : [],
            MultiChoices: !hasDependencyOnOtherField ? field.Choices : [],
            StaticName: field.StaticName,
            Hidden: field.Hidden,
            IMEMode: '',
            Direction: field.Direction,
            ReadOnlyField: field.ReadOnlyField,
            IsAutoHyperLink: false,
            DefaultValueTyped: '',
            MaxLength: field.MaxLength,
            DependentLookup: false,
            BaseDisplayFormUrl: '',
            Throttled: false,
            LookupListId: '',
            RichText: field.RichText,
            AppendOnly: field.AppendOnly,
            RichTextMode: -1,
            NumberOfLines: field.NumberOfLines,
            AllowHyperlink: field.AllowHyperlink,
            RestrictedMode: field.RestrictedMode,
            ScriptEditorAdderId: '',
            FillInChoice: field.FillInChoice,
            FormatType: -1,
            ShowAsPercentage: field.ShowAsPercentage,
            Presence: field.Presence,
            WithPicture: field.AllowDisplay,
            DefaultRender: null,
            WithPictureDetail: field.AllowDisplay,
            ListFormUrl: '',
            UserDisplayUrl: '',
            EntitySeparator: ',',
            PictureOnly: false,
            PictureSize: false,
            UserInfoListId: '',
            SharePointGroupID: -1,
            PrincipalAccountType: '',
            SearchPrincipalSource: -1,
            ResolvePrincipalSource: -1,
            UserNoQueryPermission: null,
            DisplayFormat: field.DisplayFormat,
            CalendarType: field.DateTimeCalendarType,
            ShowWeekNumber: null,
            TimeSeparator: ':',
            TimeZoneDifference: '',
            FirstDayOfWeek: 1,
            FirstWeekOfYear: 1,
            HijriAdjustment: -1,
            WorkWeek: '',
            LocaleId: '',
            LanguageId: '',
            MinJDay: -1,
            MaxJDay: -1,
            DefaultValueFormatted: '',
            SspId: '',
            TermSetId: '',
            AnchorId: '',
            AllowFillIn: null,
            WidthCSS: '',
            Lcid: -1,
            IsUseCommaAsDelimiter: true,
            Disable: false,
            WebServiceUrl: 'field.WebServiceUrl',
            HiddenListInternalName: 'field.HiddenListInternalName',
            HoursOptions: [],
            //EXTRA CONFIGURATION FOR FIELD IF ANY
            DependentField: _field ? _field["dependentField"] : "",
            CommandType: _field ? _field["commandType"] : "",
            CommandText: _field ? _field["commandText"] : ""
        }
        return _fs;
    }
    function getFieldSchemaObjectForButton(field: any): IFieldSchema {
        let _apiDetails = field['apiDetails'];
        let _buttonTitle = field['buttonTitle'];
        let _validationDetails = field['validationDetails'];
        let _fs: IFieldSchema = {
            Title: _buttonTitle,
            Actions: field['actions'],
            ValidationDetails: _validationDetails,
            ApiDetails: _apiDetails,
            Id: _buttonTitle,
            InternalName: _buttonTitle,
            Name: _buttonTitle,
            Required: false,
            FieldType: 'Button',
            Type: field['type'],
            Description: field['tooltip'],
            Disable: field['disabled']
        }
        return _fs;
    }
    // function updateDependentFields(fieldName: string, newValue: any): IFieldInfo[] {
    //     let extraConfig = JSON.parse(formConfiguration);
    //     let _dependentFields = Object.values(extraConfig.fields).filter((x: any) => x['dependentField'] == fieldName);//extraConfig.fields.filter((f: { [x: string]: string; }) => f["dependentField"] == fieldName);
    //     console.log('dependent fields ', _dependentFields);
    //     const _state = { ...state };
    //     let _formFields = _state.formFields;
    //     _formFields.map((_formField: IFieldInfo, index: number, array: IFieldInfo[]) => {
    //         if (_dependentFields.filter(x => x['fieldInternalName' as keyof typeof x] == _formField.InternalName).length > 0) {
    //             if (_formField.TypeAsString == "Choice" || _formField.TypeAsString == "MultiChoice") {
    //                 //replace this hard coded object with actual web api call
    //                 let options: any[] = [
    //                     { "ASSET_CLASS": "FIL Managed Equity" },
    //                     { "ASSET_CLASS": "FIL Managed Fixed Income" },
    //                     { "ASSET_CLASS": "FIL Managed Real Estate" },
    //                     { "ASSET_CLASS": "FIL Managed Systematic" },
    //                     { "ASSET_CLASS": "Multi Asset" },
    //                     { "ASSET_CLASS": "Unmapped" },
    //                 ];
    //                 _formField.Choices = options.map(x => { return Object.values(x)[0].toString(); });
    //             }
    //         }
    //     });
    //     console.log("updated _formFields", _formFields, _state.formFields);
    //     return _formFields;
    //     // setState(_state);
    // }
    function updateDependentFields(fieldName: string, newValue: any): IFieldSchema[] {
        let extraConfig = formConfiguration;
        let _dependentFields = Object.values(extraConfig.fields).filter((x: any) => x['dependentField'] == fieldName);//extraConfig.fields.filter((f: { [x: string]: string; }) => f["dependentField"] == fieldName);
        // console.log('dependent fields ', _dependentFields);
        const _state = { ...state };
        let _fieldsSchema = _state.fieldsSchema;
        _fieldsSchema.map((_fieldSchema: IFieldSchema, index: number, array: IFieldSchema[]) => {
            if (_dependentFields.filter(x => x['fieldInternalName' as keyof typeof x] == _fieldSchema.InternalName).length > 0) {
                if (_fieldSchema.FieldType == "Choice" || _fieldSchema.FieldType == "MultiChoice") {
                    //replace this hard coded object with actual web api call
                    let options: any[] = [
                        { "ASSET_CLASS": "FIL Managed Equity" },
                        { "ASSET_CLASS": "FIL Managed Fixed Income" },
                        { "ASSET_CLASS": "FIL Managed Real Estate" },
                        { "ASSET_CLASS": "FIL Managed Systematic" },
                        { "ASSET_CLASS": "Multi Asset" },
                        { "ASSET_CLASS": "Unmapped" },
                    ];
                    _fieldSchema.Choices = options.map(x => { return Object.values(x)[0].toString(); });
                    _fieldSchema.MultiChoices = options.map(x => { return Object.values(x)[0].toString(); });
                    _fieldSchema.ChoiceCount = options.length;
                }
            }
        });
        // console.log("updated _fieldsSchema", _fieldsSchema, _state.fieldsSchema);
        return _fieldsSchema;
        // setState(_state);
    }
}




// function isEmptyOrNull(val: any): boolean {
//     return (val == undefined || val == null || val == "");
// }


