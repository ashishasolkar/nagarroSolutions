//SAMPLE - FORM CONFIGURATION
let temp =
{
    formTitle: "Dynamic Form Rendering",
    listName: "GenList",
    listViewName: "Cascading Dropdowns",
    fields:
    {
        "Cascade_ChoiceColumn2": {
            fieldInternalName: "Cascade_ChoiceColumn2",
            dependentField: "Cascade_ChoiceColumn1",
            commandType: "",
            commandText: "view",
        },
        "Cascade_ChoiceColumn3": {
            fieldInternalName: "Cascade_ChoiceColumn3",
            dependentField: "Cascade_ChoiceColumn2",
            commandType: "",
            commandText: "view",
        }
    },
    buttons: [
        {
            buttonTitle: "Search",
            tooltip: "This is tooltip",
            disabled: false,
            type: "default",
            actions: ["validate", "submitToApi"],
            validationDetails: {
            },
            apiDetails: {
                apiUrl: '',
                inputParameters: [
                    {
                        parameterName: "choiceCol",
                        parameterValue: "Cascade_ChoiceColumn1"
                    }
                ],
                outputParameters: []
            },
            style: {
                iconName: 'Search'
            }
        }
    ]
};