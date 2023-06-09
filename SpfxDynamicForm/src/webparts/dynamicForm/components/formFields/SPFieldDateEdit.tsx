import * as React from 'react';
import * as moment from 'moment';
import { css } from 'office-ui-fabric-react/lib/Utilities';
import { Locales } from '../../../../common/Locales';
import { ISPFormFieldProps } from './SPFormField';
import DateFormField from './DateFormField';

// import * as strings from 'FormFieldStrings';
import styles from './SPFormField.module.scss';

const SPFieldDateEdit: React.SFC<ISPFormFieldProps> = (props) => {
  const locale = Locales[1033];//en-us
  return <DateFormField
    className={css(styles.dateFormField, 'ard-dateFormField', 'ms-Grid-col')}
    placeholder={""}//{strings.DateFormFieldPlaceholder}
    isRequired={props.fieldSchema.Required}
    ariaLabel={props.fieldSchema.Title}
    locale={locale}
    firstDayOfWeek={props.fieldSchema.FirstDayOfWeek}
    allowTextInput={true}
    fieldSchema={props.fieldSchema}
    value={props.value}
    valueChanged={props.onEventTriggered}
  />;
};

export default SPFieldDateEdit;